import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  addMatchView,
  getMatch,
  likeMatch,
  listCountries,
  listFactions,
  unlikeMatch,
} from "../api/client";
import type { Country, Faction, MatchDetail } from "../api/client";
import { RESULT_LABELS } from "../constants/matchResults";
import PageLayout from "../components/PageLayout";
import Button from "../components/Button";

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { session } = useAuth();

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    Promise.all([getMatch(matchId), listFactions(), listCountries()])
      .then(([m, f, c]) => {
        setMatch(m);
        setFactions(f);
        setCountries(c);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar la partida"))
      .finally(() => setLoading(false));
    addMatchView(matchId).catch(() => {});
  }, [matchId]);

  async function toggleLike() {
    if (!session || !match) return;
    setLikeBusy(true);
    try {
      if (liked) {
        await unlikeMatch(session.idToken, match.id);
        setMatch((prev) => (prev ? { ...prev, likes_count: prev.likes_count - 1 } : prev));
        setLiked(false);
      } else {
        await likeMatch(session.idToken, match.id);
        setMatch((prev) => (prev ? { ...prev, likes_count: prev.likes_count + 1 } : prev));
        setLiked(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el like");
    } finally {
      setLikeBusy(false);
    }
  }

  const factionById = new Map(factions.map((f) => [f.id, f]));
  const countryByCode = new Map(countries.map((c) => [c.code, c]));

  if (loading) {
    return (
      <PageLayout>
        <p className="text-[var(--color-text-muted)]">Cargando...</p>
      </PageLayout>
    );
  }

  if (error || !match) {
    return (
      <PageLayout>
        <p className="text-sm text-[var(--color-danger)]">{error ?? "Partida no encontrada"}</p>
      </PageLayout>
    );
  }

  const faction = factionById.get(match.faction_id);
  const opponentFaction = factionById.get(match.opponent_faction_id);
  const country = countryByCode.get(match.country_code);

  return (
    <PageLayout>
      <div className="flex items-center gap-4">
        {faction?.logo_url && <img src={faction.logo_url} alt={faction.name} className="h-14 w-14 rounded-full" />}
        <div>
          <h1 className="text-2xl font-bold">
            {faction?.name ?? match.faction_id} vs {opponentFaction?.name ?? match.opponent_faction_id}
          </h1>
          <p className="text-[var(--color-text-muted)]">
            {country?.name ?? match.country_code} · {RESULT_LABELS[match.result]} ·{" "}
            {new Date(match.created_at).toLocaleDateString()}
          </p>
        </div>
        {opponentFaction?.logo_url && (
          <img src={opponentFaction.logo_url} alt={opponentFaction.name} className="h-14 w-14 rounded-full" />
        )}
      </div>

      {match.text && <p className="mt-6 whitespace-pre-wrap">{match.text}</p>}

      {match.images.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {match.images.map((img) => (
            <img key={img.id} src={img.url} alt="" className="h-48 w-auto rounded-lg border border-[var(--color-border)]" />
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
        <span>{match.views_count} vistas</span>
        {session ? (
          <Button variant="secondary" className="px-3 py-1" onClick={toggleLike} disabled={likeBusy}>
            {liked ? "❤ Quitar like" : "♡ Me gusta"} ({match.likes_count})
          </Button>
        ) : (
          <span>❤ {match.likes_count} likes</span>
        )}
      </div>
    </PageLayout>
  );
}
