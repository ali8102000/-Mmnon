import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { supabase } from "@/lib/supabase";

const BACKGROUND_TASK = "background-location-task";

type Coords = { lat: number; lng: number; heading?: number | null };

const MIN_DISTANCE_M = 15;
const MAX_INTERVAL_MS = 4000;

function distanceMeters(a: Coords, b: Coords): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

TaskManager.defineTask(BACKGROUND_TASK, async ({ data, error }) => {
  if (error) return;
  const locations = (data as any)?.locations;
  if (!locations || locations.length === 0) return;
  const loc = locations[0];
  const requestId = (globalThis as any).__MUMNUN_TRACKING_REQUEST_ID;
  const userId = (globalThis as any).__MUMNUN_TRACKING_USER_ID;
  const role = (globalThis as any).__MUMNUN_TRACKING_ROLE;
  if (!requestId || !userId) return;

  await supabase.from("live_locations").upsert({
    request_id: requestId,
    user_id: userId,
    role,
    lat: loc.coords.latitude,
    lng: loc.coords.longitude,
    heading: loc.coords.heading,
    updated_at: new Date().toISOString(),
  }, { onConflict: "request_id,user_id" });
});

(globalThis as any).__MUMNUN_TRACKING_REQUEST_ID = null;
(globalThis as any).__MUMNUN_TRACKING_USER_ID = null;
(globalThis as any).__MUMNUN_TRACKING_ROLE = null;

export function useLiveTracking(opts: {
  requestId: string | null;
  myUserId: string | null;
  otherUserId: string | null;
  myRole: "customer" | "provider";
  active: boolean;
}) {
  const { requestId, myUserId, otherUserId, myRole, active } = opts;
  const [me, setMe] = useState<Coords | null>(null);
  const [other, setOther] = useState<Coords | null>(null);
  const lastPushRef = useRef<Coords | null>(null);
  const lastPushTimeRef = useRef<number>(0);

  const push = async (lat: number, lng: number, heading: number | null) => {
    if (!requestId || !myUserId) return;
    const now = Date.now();
    const coords: Coords = { lat, lng, heading };
    if (lastPushRef.current) {
      const dist = distanceMeters(lastPushRef.current, coords);
      const elapsed = now - lastPushTimeRef.current;
      if (dist < MIN_DISTANCE_M && elapsed < MAX_INTERVAL_MS) return;
    }
    lastPushRef.current = coords;
    lastPushTimeRef.current = now;
    await supabase.from("live_locations").upsert({
      request_id: requestId,
      user_id: myUserId,
      role: myRole,
      lat,
      lng,
      heading,
      updated_at: new Date().toISOString(),
    }, { onConflict: "request_id,user_id" });
  };

  useEffect(() => {
    if (!active) return;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
        (loc: Location.LocationObject) => {
          const c: Coords = { lat: loc.coords.latitude, lng: loc.coords.longitude, heading: loc.coords.heading };
          setMe(c);
          push(c.lat, c.lng, c.heading ?? null);
        }
      );

      if (myRole === "provider") {
        const bgStatus = await Location.requestBackgroundPermissionsAsync();
        if (bgStatus.status === "granted") {
          (globalThis as any).__MUMNUN_TRACKING_REQUEST_ID = requestId;
          (globalThis as any).__MUMNUN_TRACKING_USER_ID = myUserId;
          (globalThis as any).__MUMNUN_TRACKING_ROLE = myRole;
          await Location.startLocationUpdatesAsync(BACKGROUND_TASK, {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
            showsBackgroundLocationIndicator: true,
          });
        }
      }

      return () => {
        sub.remove();
        if (TaskManager.isTaskDefined(BACKGROUND_TASK) && (globalThis as any).__MUMNUN_TRACKING_REQUEST_ID) {
          Location.stopLocationUpdatesAsync(BACKGROUND_TASK).catch(() => {});
          (globalThis as any).__MUMNUN_TRACKING_REQUEST_ID = null;
        }
      };
    })();

    return () => {};
  }, [active, requestId, myUserId, myRole]);

  useEffect(() => {
    if (!active || !requestId || !otherUserId) return;
    const ch = supabase
      .channel(`live-${requestId}-${Math.random().toString(36).slice(2, 8)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "live_locations", filter: `request_id=eq.${requestId}` }, (payload: any) => {
        const row = payload.new;
        if (row.user_id === otherUserId) {
          setOther({ lat: row.lat, lng: row.lng, heading: row.heading });
        }
      })
      .subscribe();

    supabase.from("live_locations").select("*").eq("request_id", requestId).eq("user_id", otherUserId).maybeSingle().then(({ data }) => {
      if (data) setOther({ lat: data.lat, lng: data.lng, heading: data.heading });
    });

    return () => { supabase.removeChannel(ch); };
  }, [active, requestId, otherUserId]);

  return { me, other };
}
