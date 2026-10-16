import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Button from "./Button";

export default function PageLayout({ children, fullWidth = false }: { children: ReactNode; fullWidth?: boolean }) {
  const { session, signOut } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
        <Link to="/" className="neon-text text-lg text-[var(--color-accent)]">
          INFINITY CAMPAIGN
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Mapa
          </Link>
          <Link to="/matches" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Partidas
          </Link>
          {session ? (
            <>
              <Link to="/factions" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                Mis ejércitos
              </Link>
              <span className="text-[var(--color-text-muted)]">{session.email}</span>
              <Button variant="secondary" onClick={signOut} className="px-3 py-1 text-sm">
                Salir
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-[var(--color-accent)] px-3 py-1 font-medium text-[#06111a] transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                Registrarme
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className={fullWidth ? "px-6 py-8" : "mx-auto max-w-5xl px-6 py-8"}>{children}</main>
    </div>
  );
}
