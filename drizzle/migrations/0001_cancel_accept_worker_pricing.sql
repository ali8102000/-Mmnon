ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS pricing_mode text,
  ADD COLUMN IF NOT EXISTS customer_price integer,
  ADD COLUMN IF NOT EXISTS work_hours numeric,
  ADD COLUMN IF NOT EXISTS work_description text;

ALTER TABLE public.request_offers ALTER COLUMN expires_at SET DEFAULT (now() + interval '24 hours');

CREATE OR REPLACE FUNCTION public.guard_customer_request_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM NEW.customer_id THEN RETURN NEW; END IF;
  IF NEW.customer_id  IS DISTINCT FROM OLD.customer_id  THEN RAISE EXCEPTION 'customer_id_immutable'; END IF;
  IF NEW.provider_id  IS DISTINCT FROM OLD.provider_id  THEN RAISE EXCEPTION 'provider_id_readonly_for_customer'; END IF;
  IF NEW.type         IS DISTINCT FROM OLD.type         THEN RAISE EXCEPTION 'type_immutable'; END IF;
  IF NEW.service_id   IS DISTINCT FROM OLD.service_id   THEN RAISE EXCEPTION 'service_id_immutable'; END IF;
  IF NEW.price_estimate IS DISTINCT FROM OLD.price_estimate THEN RAISE EXCEPTION 'price_readonly_for_customer'; END IF;
  IF NEW.commission   IS DISTINCT FROM OLD.commission   THEN RAISE EXCEPTION 'commission_readonly'; END IF;
  IF NEW.accepted_at  IS DISTINCT FROM OLD.accepted_at  THEN RAISE EXCEPTION 'accepted_at_readonly'; END IF;
  IF NEW.started_at   IS DISTINCT FROM OLD.started_at   THEN RAISE EXCEPTION 'started_at_readonly'; END IF;
  IF NEW.completed_at IS DISTINCT FROM OLD.completed_at THEN RAISE EXCEPTION 'completed_at_readonly'; END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (NEW.status = 'cancelled' AND OLD.status IN ('pending','searching','accepted','in_progress')) THEN
      RAISE EXCEPTION 'invalid_status_transition_for_customer';
    END IF;
    NEW.cancelled_by := 'customer';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.guard_customer_request_update() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.cancel_service_request(_request_id uuid, _reason text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT id, customer_id, provider_id, status INTO r FROM public.service_requests WHERE id = _request_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'request_not_found'; END IF;
  IF r.status IN ('completed','cancelled') THEN RAISE EXCEPTION 'request_finished'; END IF;
  IF r.customer_id = auth.uid() THEN
    UPDATE public.service_requests SET status = 'cancelled', cancellation_reason = left(_reason, 500) WHERE id = _request_id;
    DELETE FROM public.request_offers WHERE request_id = _request_id;
    RETURN 'cancelled';
  ELSIF r.provider_id = auth.uid() THEN
    UPDATE public.service_requests
      SET status = 'searching', provider_id = NULL, accepted_at = NULL,
          cancelled_by = 'provider', cancellation_reason = left(_reason, 500)
      WHERE id = _request_id;
    DELETE FROM public.request_offers WHERE request_id = _request_id AND provider_id = auth.uid();
    RETURN 'released';
  END IF;
  RAISE EXCEPTION 'forbidden';
END $$;
REVOKE ALL ON FUNCTION public.cancel_service_request(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_service_request(uuid, text) TO authenticated;

DROP POLICY IF EXISTS "Driver sees offered taxi request" ON public.service_requests;
CREATE POLICY "Driver sees offered taxi request"
ON public.service_requests FOR SELECT TO authenticated
USING (
  type = 'taxi'::public.request_type
  AND status IN ('pending'::public.request_status, 'searching'::public.request_status)
  AND EXISTS (SELECT 1 FROM public.request_offers o
    WHERE o.request_id = service_requests.id AND o.provider_id = auth.uid())
);

CREATE OR REPLACE FUNCTION public.accept_service_request(_request_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_customer uuid; v_updated integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  IF NOT (public.has_role(auth.uid(), 'driver') OR public.has_role(auth.uid(), 'worker')) THEN
    RAISE EXCEPTION 'provider_role_required';
  END IF;
  UPDATE public.service_requests
  SET provider_id = auth.uid(), status = 'accepted', accepted_at = now()
  WHERE id = _request_id
    AND status IN ('pending'::public.request_status, 'searching'::public.request_status)
    AND (
      (type = 'taxi'::public.request_type AND public.has_role(auth.uid(), 'driver')
        AND EXISTS (SELECT 1 FROM public.request_offers o
          WHERE o.request_id = _request_id AND o.provider_id = auth.uid()))
      OR
      (type = 'service'::public.request_type AND public.has_role(auth.uid(), 'worker')
        AND (service_id IS NULL OR EXISTS (SELECT 1 FROM public.worker_services ws
          WHERE ws.worker_id = auth.uid() AND ws.service_id = service_requests.service_id)))
    )
  RETURNING customer_id INTO v_customer;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN RAISE EXCEPTION 'request_unavailable'; END IF;
  INSERT INTO public.chats (request_id, customer_id, provider_id)
  VALUES (_request_id, v_customer, auth.uid()) ON CONFLICT DO NOTHING;
  DELETE FROM public.request_offers WHERE request_id = _request_id AND provider_id <> auth.uid();
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.accept_service_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_service_request(uuid) TO authenticated;