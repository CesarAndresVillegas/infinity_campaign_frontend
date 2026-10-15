import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listFactions, getMe, registerFaction } from "../api/client";
import type { Faction, UserFaction } from "../api/client";
import { RANK_NAMES } from "../constants/ranks";

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

  if (loading) return <p>Cargando...</p>;

  const myFactionIds = new Set(myFactions.map((f) => f.faction_id));

  return (
    <div>
      <h1>Mis ejércitos</h1>
      <p>
        <Link to="/">Volver</Link>
      </p>
      {error && <p role="alert">{error}</p>}

      {myFactions.length > 0 && (
        <>
          <h2>Ejércitos registrados</h2>
          <ul>
            {myFactions.map((uf) => {
              const faction = factions.find((f) => f.id === uf.faction_id);
              return (
                <li key={uf.faction_id}>
                  {faction?.name ?? uf.faction_id} — {uf.points} pts — {RANK_NAMES[uf.rank] ?? uf.rank}
                </li>
              );
            })}
          </ul>
        </>
      )}

      <h2>Registrar un nuevo ejército</h2>
      <ul>
        {factions
          .filter((f) => !myFactionIds.has(f.id))
          .map((faction) => (
            <li key={faction.id}>
              {faction.name}{" "}
              <button
                type="button"
                onClick={() => handleRegister(faction.id)}
                disabled={registeringId === faction.id}
              >
                Registrar
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
