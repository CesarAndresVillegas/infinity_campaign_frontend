import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listFactions, getMe, registerFaction } from "../api/client";
import type { Faction, UserFaction } from "../api/client";
import { RANK_NAMES } from "../constants/ranks";
import PageLayout from "../components/PageLayout";
import Button from "../components/Button";

export default function FactionsPage() {
  const { session } = useAuth();
  const [factions, setFactions] = useState<Faction[]>([]);
  const [myFactions, setMyFactions] = useState<UserFaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  async function loadData() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const [allFactions, me] = await Promise.all([listFactions(), getMe(session.idToken)]);
      setFactions(allFactions);
      setMyFactions(me.factions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la información");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleRegister(factionId: string) {
    if (!session) return;
    setError(null);
    setRegisteringId(factionId);
    try {
      const userFaction = await registerFaction(session.idToken, factionId);
      setMyFactions((prev) => [...prev, userFaction]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la facción");
    } finally {
      setRegisteringId(null);
    }
  }

  const myFactionIds = new Set(myFactions.map((f) => f.faction_id));

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold">Mis ejércitos</h1>
      {error && <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>}

      {loading ? (
        <p className="mt-6 text-[var(--color-text-muted)]">Cargando...</p>
      ) : (
        <>
          {myFactions.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-[var(--color-accent)]">Registrados</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {myFactions.map((uf) => {
                  const faction = factions.find((f) => f.id === uf.faction_id);
                  return (
                    <div
                      key={uf.faction_id}
                      className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                    >
                      {faction?.logo_url && (
                        <img src={faction.logo_url} alt={faction.name} className="h-10 w-10 rounded-full" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{faction?.name ?? uf.faction_id}</p>
                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                          {uf.points} pts — {RANK_NAMES[uf.rank] ?? uf.rank}
                        </p>
                      </div>
                      <Link
                        to={`/forum/${uf.faction_id}`}
                        className="text-sm text-[var(--color-accent)] hover:underline"
                      >
                        Foro
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-[var(--color-accent)]">Registrar un nuevo ejército</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {factions
                .filter((f) => !myFactionIds.has(f.id))
                .map((faction) => (
                  <div
                    key={faction.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                  >
                    <span className="flex items-center gap-3 font-medium">
                      {faction.logo_url && (
                        <img src={faction.logo_url} alt={faction.name} className="h-8 w-8 rounded-full" />
                      )}
                      {faction.name}
                    </span>
                    <Button
                      variant="secondary"
                      className="px-3 py-1 text-sm"
                      onClick={() => handleRegister(faction.id)}
                      disabled={registeringId === faction.id}
                    >
                      Registrar
                    </Button>
                  </div>
                ))}
            </div>
          </section>
        </>
      )}
    </PageLayout>
  );
}
