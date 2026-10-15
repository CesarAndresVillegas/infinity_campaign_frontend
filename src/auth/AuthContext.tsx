import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as cognito from "./cognitoClient";
import type { Session } from "./cognitoClient";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cognito.getCurrentSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  async function signIn(email: string, password: string) {
    const s = await cognito.signIn(email, password);
    setSession(s);
  }

  function signOut() {
    cognito.signOut();
    setSession(null);
  }

  return <AuthContext.Provider value={{ session, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
