import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Database } from "./types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = "customer" | "driver" | "worker" | "admin" | "super_admin" | "support" | "finance" | "moderator";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  profile: null,
  roles: [],
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    setProfile(p as Profile | null);
  }, []);

  const loadRoles = useCallback(async (uid: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    const r = (data?.map((d: any) => d.role as AppRole) ?? []) as AppRole[];
    setRoles(r);
  }, []);

  const refresh = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    setSession(s);
    if (s?.user) {
      await Promise.all([loadProfile(s.user.id), loadRoles(s.user.id)]);
    } else {
      setProfile(null);
      setRoles([]);
    }
    setLoading(false);
  }, [loadProfile, loadRoles]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setRoles([]);
  }, []);

  useEffect(() => {
    refresh();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s?.user) {
        await Promise.all([loadProfile(s.user.id), loadRoles(s.user.id)]);
      } else {
        setProfile(null);
        setRoles([]);
      }
      setLoading(false);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [refresh, loadProfile, loadRoles]);

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, profile, roles, loading, refresh, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
