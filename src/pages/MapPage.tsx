import { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { listCountries, listFactions } from "../api/client";
import type { Country, Faction } from "../api/client";
import { FACTION_COLORS, UNCLAIMED_COLOR } from "../constants/factionColors";
import countryNumericToAlpha2 from "../data/countryNumericToAlpha2.json";
import PageLayout from "../components/PageLayout";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface TooltipState {
  x: number;
  y: number;
  countryName: string;
  factionName: string | null;
  factionLogoUrl: string | null;
}

export default function MapPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    Promise.all([listCountries(), listFactions()])
      .then(([c, f]) => {
        setCountries(c);
        setFactions(f);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar el mapa"))
      .finally(() => setLoading(false));
  }, []);

  const countryByCode = useMemo(() => {
    const map = new Map<string, Country>();
    for (const c of countries) map.set(c.code, c);
    return map;
  }, [countries]);

  const factionById = useMemo(() => {
    const map = new Map<string, Faction>();
    for (const f of factions) map.set(f.id, f);
    return map;
  }, [factions]);

  return (
    <PageLayout fullWidth>
      <h1 className="text-2xl font-bold">Mapa de campaña</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        Facción dominante por país, actualizada automáticamente según las partidas reportadas.
      </p>

      {error && (
        <p className="mt-3 text-sm text-[var(--color-danger)]">
          No se pudo cargar el estado del mapa ({error}). El mapa base se muestra igual.
        </p>
      )}

      <div className="relative mt-6 h-[75vh] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {loading && (
          <p className="absolute left-4 top-4 z-10 text-sm text-[var(--color-text-muted)]">Cargando...</p>
        )}
        <ComposableMap
          width={800}
          height={450}
          projectionConfig={{ scale: 147 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const alpha2 = (countryNumericToAlpha2 as Record<string, string>)[geo.id as string];
                  const country = alpha2 ? countryByCode.get(alpha2) : undefined;
                  const factionId = country?.dominant_faction_id ?? null;
                  const fill = factionId ? (FACTION_COLORS[factionId] ?? UNCLAIMED_COLOR) : UNCLAIMED_COLOR;
                  const dominantFaction = factionId ? factionById.get(factionId) : undefined;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#0a0e16"
                      strokeWidth={0.5}
                      onMouseEnter={(evt) => {
                        setTooltip({
                          x: evt.clientX,
                          y: evt.clientY,
                          countryName: country?.name ?? String(geo.properties?.name ?? "Desconocido"),
                          factionName: factionId ? (dominantFaction?.name ?? factionId) : null,
                          factionLogoUrl: dominantFaction?.logo_url ?? null,
                        });
                      }}
                      onMouseMove={(evt) => {
                        setTooltip((prev) => (prev ? { ...prev, x: evt.clientX, y: evt.clientY } : prev));
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className="cursor-pointer outline-none transition-[filter] duration-150 hover:brightness-125"
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-20 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          <p className="font-semibold">{tooltip.countryName}</p>
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            {tooltip.factionLogoUrl && (
              <img src={tooltip.factionLogoUrl} alt={tooltip.factionName ?? ""} className="h-4 w-4 rounded-full" />
            )}
            <span>{tooltip.factionName ? tooltip.factionName : "Sin reclamar"}</span>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-4">
        {factions.map((f) => (
          <div key={f.id} className="flex items-center gap-2 text-sm">
            {f.logo_url ? (
              <img src={f.logo_url} alt={f.name} className="h-5 w-5 rounded-full" />
            ) : (
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: FACTION_COLORS[f.id] ?? UNCLAIMED_COLOR }}
              />
            )}
            <span className="text-[var(--color-text-muted)]">{f.name}</span>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
