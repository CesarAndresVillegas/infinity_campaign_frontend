import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createMatch, getMe, listCountries, listFactions } from "../api/client";
import type { Country, Faction, MatchResult, UserFaction } from "../api/client";
import { RESULT_LABELS } from "../constants/matchResults";
import PageLayout from "../components/PageLayout";
import Input from "../components/Input";
import Button from "../components/Button";

export default function ReportMatchPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [myFactions, setMyFactions] = useState<UserFaction[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [factionId, setFactionId] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [opponentFactionId, setOpponentFactionId] = useState("");
  const [result, setResult] = useState<MatchResult>("win");
  const [text, setText] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) return;
    Promise.all([getMe(session.idToken), listFactions(), listCountries()])
      .then(([me, allFactions, allCountries]) => {
        setMyFactions(me.factions);
        setFactions(allFactions);
        setCountries(allCountries.filter((c) => c.is_active).sort((a, b) => a.name.localeCompare(b.name)));
        if (me.factions.length > 0) setFactionId(me.factions[0].faction_id);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "No se pudo cargar el formulario"))
      .finally(() => setLoading(false));
  }, [session]);

  function updateImageUrl(index: number, value: string) {
    setImageUrls((prev) => prev.map((url, i) => (i === index ? value : url)));
  }

  function addImageUrlField() {
    setImageUrls((prev) => [...prev, ""]);
  }

  function removeImageUrlField(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setError(null);

    if (!factionId || !countryCode || !opponentFactionId) {
      setError("Completa facción propia, país y facción oponente");
      return;
    }

    setSubmitting(true);
    try {
      const match = await createMatch(session.idToken, {
        factionId,
        countryCode,
        opponentFactionId,
        result,
        text: text.trim() ? text.trim() : undefined,
        imageUrls: imageUrls.map((url) => url.trim()).filter(Boolean),
      });
      navigate(`/matches/${match.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reportar la partida");
    } finally {
      setSubmitting(false);
    }
  }

  const factionById = new Map(factions.map((f) => [f.id, f]));

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold">Reportar partida</h1>

      {loading ? (
        <p className="mt-6 text-[var(--color-text-muted)]">Cargando...</p>
      ) : loadError ? (
        <p className="mt-6 text-sm text-[var(--color-danger)]">{loadError}</p>
      ) : myFactions.length === 0 ? (
        <p className="mt-6 text-[var(--color-text-muted)]">
          Primero necesitas registrar un ejército en{" "}
          <a href="/factions" className="text-[var(--color-accent)] hover:underline">
            Mis ejércitos
          </a>
          .
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-[var(--color-text-muted)]">Tu facción</span>
            <select
              value={factionId}
              onChange={(e) => setFactionId(e.target.value)}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            >
              {myFactions.map((uf) => (
                <option key={uf.faction_id} value={uf.faction_id}>
                  {factionById.get(uf.faction_id)?.name ?? uf.faction_id}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-[var(--color-text-muted)]">País donde se jugó</span>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              required
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="">Selecciona un país</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-[var(--color-text-muted)]">Facción del oponente</span>
            <select
              value={opponentFactionId}
              onChange={(e) => setOpponentFactionId(e.target.value)}
              required
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="">Selecciona una facción</option>
              {factions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-[var(--color-text-muted)]">Resultado</span>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as MatchResult)}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            >
              {(Object.keys(RESULT_LABELS) as MatchResult[]).map((r) => (
                <option key={r} value={r}>
                  {RESULT_LABELS[r]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-[var(--color-text-muted)]">Reporte (opcional)</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Cómo fue la partida..."
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)]"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">Imágenes (opcional, URLs)</span>
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                />
                {imageUrls.length > 1 && (
                  <Button type="button" variant="secondary" onClick={() => removeImageUrlField(index)}>
                    Quitar
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="secondary" className="self-start" onClick={addImageUrlField}>
              Añadir otra imagen
            </Button>
          </div>

          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Reportando..." : "Reportar partida"}
          </Button>
        </form>
      )}
    </PageLayout>
  );
}
