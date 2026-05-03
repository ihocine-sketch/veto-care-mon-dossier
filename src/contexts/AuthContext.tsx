import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "client" | "vet";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  roleLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  const toUserRole = (value: unknown): UserRole | null => {
    if (value === "admin" || value === "client" || value === "vet") return value;
    return null;
  };

  const loadRole = async (authUser: User | null) => {
    if (!authUser) {
      setRole(null);
      return;
    }

    setRoleLoading(true);
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("role")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (!error) {
        const dbRole = toUserRole(data?.role);
        if (dbRole) {
          setRole(dbRole);
          return;
        }
      }

      // Fallbacks when migration/policies are not ready yet.
      const metadataRole =
        toUserRole(authUser.user_metadata?.role) ??
        toUserRole(authUser.app_metadata?.role);
      setRole(metadataRole ?? "client");
    } catch {
      setRole("client");
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    const syncSessionState = async (s: Session | null) => {
      setSession(s);
      setUser(s?.user ?? null);
      await loadRole(s?.user ?? null);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      void syncSessionState(s);
    });

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        await syncSessionState(session);
      })
      .catch(() => {
        setSession(null);
        setUser(null);
        setRole(null);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setRole(null);
      setRoleLoading(false);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, roleLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const getDefaultDashboardPath = (role: UserRole | null) => {
  if (role === "admin") return "/admin";
  if (role === "vet") return "/vet";
  return "/dashboard";
};
