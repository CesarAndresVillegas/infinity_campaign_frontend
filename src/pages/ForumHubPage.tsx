import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listFactions, getMe } from "../api/client";
import type { Faction, UserFaction } from "../api/client";
import PageLayout from "../components/PageLayout";

export default function ForumHubPage() {
  const { session } = useAuth();
  const [factions, setFactions] = useState<Faction[]>([]);
  const [myFactions, setMyFactions] = useState<UserFaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    setError(null);
    Promise.all([listFactions(), getMe(session.idToken)])
      .then(([allFactions, me]) => {
        setFactions(allFactions);
        setMyFactions(me.factions);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar el foro"))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold">Foro</h1>

      {error && <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>}

      {loading ? (
        <p className="mt-6 text-[var(--color-text-muted)]">Cargando...</p>
      ) : myFactions.length === 0 ? (
        <p className="mt-6 text-[var(--color-text-muted)]">
          Todavía no tienes ejércitos registrados.{" "}
          <Link to="/factions" className="text-[var(--color-accent)] hover:underline">
            Registra uno
          </Link>{" "}
          para acceder a su foro.
        </p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {myFactions.map((uf) => {
            const faction = factions.find((f) => f.id === uf.faction_id);
            return (
              <Link
                key={uf.faction_id}
                to={`/forum/${uf.faction_id}`}
                className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:bg-[var(--color-surface-hover)]"
              >
                {faction?.logo_url && (
                  <img src={faction.logo_url} alt={faction.name} className="h-10 w-10 rounded-full" />
                )}
                <span className="font-semibold">{faction?.name ?? uf.faction_id}</span>
              </Link>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
