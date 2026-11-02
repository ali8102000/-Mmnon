CREATE OR REPLACE FUNCTION public.is_request_customer(_request_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.service_requests WHERE id = _request_id AND customer_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.has_pending_offer(_request_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.request_offers
    WHERE request_id = _request_id AND provider_id = _user_id
      AND status = 'pending' AND expires_at > now()
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_request_customer(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_pending_offer(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_request_customer(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_pending_offer(uuid, uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Customer sees offers for own request" ON public.request_offers;
CREATE POLICY "Customer sees offers for own request" ON public.request_offers
  FOR SELECT TO authenticated
  USING (public.is_request_customer(request_id, auth.uid()));

DROP POLICY IF EXISTS "Driver sees offered taxi request" ON public.service_requests;
CREATE POLICY "Driver sees offered taxi request" ON public.service_requests
  FOR SELECT TO authenticated
  USING (type = 'taxi'::public.request_type
    AND status = 'searching'::public.request_status
    AND public.has_pending_offer(id, auth.uid()));