import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createMatch, getMe, listCountries, listFactions, uploadMatchImage } from "../api/client";
import type { Country, Faction, MatchResult, UserFaction } from "../api/client";
import { RESULT_LABELS } from "../constants/matchResults";
import PageLayout from "../components/PageLayout";
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

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

  function addImageFiles(files: FileList | null) {
    if (!files) return;
    setImageFiles((prev) => [...prev, ...Array.from(files)]);
  }

  function removeImageFile(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
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
      const imageUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        setUploadProgress(`Subiendo imagen ${i + 1} de ${imageFiles.length}...`);
        imageUrls.push(await uploadMatchImage(session.idToken, imageFiles[i]));
      }
      setUploadProgress(null);

      const match = await createMatch(session.idToken, {
        factionId,
        countryCode,
        opponentFactionId,
        result,
        text: text.trim() ? text.trim() : undefined,
        imageUrls,
      });
      navigate(`/matches/${match.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reportar la partida");
    } finally {
      setUploadProgress(null);
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
            <span className="text-sm text-[var(--color-text-muted)]">Imágenes (opcional)</span>
            {imageFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-20 w-20 rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageFile(index)}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-danger)] text-xs text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={(e) => {
                addImageFiles(e.target.files);
                e.target.value = "";
              }}
              className="text-sm text-[var(--color-text-muted)]"
            />
          </div>

          {uploadProgress && <p className="text-sm text-[var(--color-text-muted)]">{uploadProgress}</p>}
          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Reportando..." : "Reportar partida"}
          </Button>
        </form>
      )}
    </PageLayout>
  );
}
