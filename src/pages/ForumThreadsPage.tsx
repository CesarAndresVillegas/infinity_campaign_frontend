import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createThread, getUser, listFactions, listThreads } from "../api/client";
import type { Faction, ForumThread } from "../api/client";
import PageLayout from "../components/PageLayout";
import Input from "../components/Input";
import Button from "../components/Button";

export default function ForumThreadsPage() {
  const { factionId } = useParams<{ factionId: string }>();
  const { session } = useAuth();

  const [faction, setFaction] = useState<Faction | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [authorEmails, setAuthorEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!factionId || !session) return;
    setLoading(true);
    setError(null);
    Promise.all([listFactions(), listThreads(session.idToken, factionId)])
      .then(async ([allFactions, threadRows]) => {
        setFaction(allFactions.find((f) => f.id === factionId) ?? null);
        setThreads(threadRows);

        const uniqueAuthorIds = [...new Set(threadRows.map((t) => t.author_user_id))];
        const emailEntries = await Promise.all(
          uniqueAuthorIds.map(async (id) => [id, (await getUser(session.idToken, id)).email] as const)
        );
        setAuthorEmails(Object.fromEntries(emailEntries));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar el foro"))
      .finally(() => setLoading(false));
  }, [factionId, session]);

  async function handleCreateThread(e: FormEvent) {
    e.preventDefault();
    if (!session || !factionId || !newTitle.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const thread = await createThread(session.idToken, factionId, newTitle.trim());
      setThreads((prev) => [thread, ...prev]);
      setAuthorEmails((prev) => ({ ...prev, [thread.author_user_id]: session.email }));
      setNewTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el tema");
    } finally {
      setCreating(false);
    }
  }

  return (
    <PageLayout>
      <div className="flex items-center gap-3">
        {faction?.logo_url && <img src={faction.logo_url} alt={faction.name} className="h-10 w-10 rounded-full" />}
        <h1 className="text-2xl font-bold">Foro {faction ? `— ${faction.name}` : ""}</h1>
      </div>

      {loading ? (
        <p className="mt-6 text-[var(--color-text-muted)]">Cargando...</p>
      ) : error ? (
        <p className="mt-6 text-sm text-[var(--color-danger)]">{error}</p>
      ) : (
        <>
          <form onSubmit={handleCreateThread} className="mt-6 flex max-w-xl gap-2">
            <Input
              placeholder="Título del nuevo tema"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <Button type="submit" disabled={creating}>
              Crear tema
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3">
            {threads.length === 0 ? (
              <p className="text-[var(--color-text-muted)]">Todavía no hay temas en este foro.</p>
            ) : (
              threads.map((thread) => (
                <Link
                  key={thread.id}
                  to={`/forum/${factionId}/${thread.id}`}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:bg-[var(--color-surface-hover)]"
                >
                  <p className="font-medium">{thread.title}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {authorEmails[thread.author_user_id] ?? "..."} ·{" "}
                    {new Date(thread.created_at).toLocaleDateString()}
                  </p>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
}
