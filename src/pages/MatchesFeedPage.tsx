import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listCountries, listFactions, listMatches } from "../api/client";
import type { Country, Faction, MatchWithLikes } from "../api/client";
import { RESULT_LABELS } from "../constants/matchResults";
import PageLayout from "../components/PageLayout";
import Button from "../components/Button";

export default function MatchesFeedPage() {
  const { session } = useAuth();
  const [matches, setMatches] = useState<MatchWithLikes[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listMatches(), listFactions(), listCountries()])
      .then(([m, f, c]) => {
        setMatches(m);
        setFactions(f);
        setCountries(c);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar las partidas"))
      .finally(() => setLoading(false));
  }, []);

  const factionById = new Map(factions.map((f) => [f.id, f]));
  const countryByCode = new Map(countries.map((c) => [c.code, c]));

  return (
    <PageLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Partidas recientes</h1>
        {session && (
          <Link to="/matches/new">
            <Button>Reportar partida</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <p className="mt-6 text-[var(--color-text-muted)]">Cargando...</p>
      ) : error ? (
        <p className="mt-6 text-sm text-[var(--color-danger)]">{error}</p>
      ) : matches.length === 0 ? (
        <p className="mt-6 text-[var(--color-text-muted)]">Todavía no hay partidas reportadas.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {matches.map((match) => {
            const faction = factionById.get(match.faction_id);
            const opponentFaction = factionById.get(match.opponent_faction_id);
            const country = countryByCode.get(match.country_code);
            return (
              <Link
                key={match.id}
                to={`/matches/${match.id}`}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:bg-[var(--color-surface-hover)]"
              >
                <div className="flex items-center gap-3">
                  {faction?.logo_url && <img src={faction.logo_url} alt={faction.name} className="h-8 w-8 rounded-full" />}
                  <span className="font-medium">{faction?.name ?? match.faction_id}</span>
                  <span className="text-[var(--color-text-muted)]">vs</span>
                  {opponentFaction?.logo_url && (
                    <img src={opponentFaction.logo_url} alt={opponentFaction.name} className="h-8 w-8 rounded-full" />
                  )}
                  <span className="font-medium">{opponentFaction?.name ?? match.opponent_faction_id}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                  <span>{country?.name ?? match.country_code}</span>
                  <span>{RESULT_LABELS[match.result]}</span>
                  <span>❤ {match.likes_count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
