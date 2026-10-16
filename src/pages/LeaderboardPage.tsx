import { useEffect, useState } from "react";
import { getLeaderboard, listFactions } from "../api/client";
import type { Faction, LeaderboardEntry } from "../api/client";
import { RANK_NAMES } from "../constants/ranks";
import PageLayout from "../components/PageLayout";

export default function LeaderboardPage() {
  const [factions, setFactions] = useState<Faction[]>([]);
  const [selectedFactionId, setSelectedFactionId] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loadingFactions, setLoadingFactions] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listFactions()
      .then((rows) => {
        setFactions(rows);
        if (rows.length > 0) setSelectedFactionId(rows[0].id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar las facciones"))
      .finally(() => setLoadingFactions(false));
  }, []);

  useEffect(() => {
    if (!selectedFactionId) return;
    setLoadingEntries(true);
    setError(null);
    getLeaderboard(selectedFactionId)
      .then(setEntries)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar la tabla"))
      .finally(() => setLoadingEntries(false));
  }, [selectedFactionId]);

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold">Tabla de posiciones</h1>

      {loadingFactions ? (
        <p className="mt-6 text-[var(--color-text-muted)]">Cargando...</p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {factions.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFactionId(f.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  selectedFactionId === f.id
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[#06111a]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                {f.logo_url && <img src={f.logo_url} alt={f.name} className="h-5 w-5 rounded-full" />}
                {f.name}
              </button>
            ))}
          </div>

          {error ? (
            <p className="mt-6 text-sm text-[var(--color-danger)]">{error}</p>
          ) : loadingEntries ? (
            <p className="mt-6 text-[var(--color-text-muted)]">Cargando...</p>
          ) : entries.length === 0 ? (
            <p className="mt-6 text-[var(--color-text-muted)]">Nadie ha registrado puntos en esta facción todavía.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">Jugador</th>
                    <th className="py-2 pr-4">Rango</th>
                    <th className="py-2 pr-4">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={entry.user_id} className="border-b border-[var(--color-border)]">
                      <td className="py-2 pr-4 text-[var(--color-text-muted)]">{index + 1}</td>
                      <td className="py-2 pr-4">{entry.email}</td>
                      <td className="py-2 pr-4">{RANK_NAMES[entry.rank] ?? entry.rank}</td>
                      <td className="py-2 pr-4 font-semibold text-[var(--color-accent)]">{entry.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
