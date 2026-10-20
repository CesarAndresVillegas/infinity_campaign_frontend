import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createPost, deletePost, getUser, listPosts } from "../api/client";
import type { ForumPost } from "../api/client";
import PageLayout from "../components/PageLayout";
import Button from "../components/Button";

export default function ForumThreadPage() {
  const { factionId, threadId } = useParams<{ factionId: string; threadId: string }>();
  const { session } = useAuth();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [authorEmails, setAuthorEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!threadId || !session) return;
    setLoading(true);
    setError(null);
    listPosts(session.idToken, threadId)
      .then(async (rows) => {
        setPosts(rows);
        const uniqueAuthorIds = [...new Set(rows.map((p) => p.author_user_id))];
        const emailEntries = await Promise.all(
          uniqueAuthorIds.map(async (id) => [id, (await getUser(session.idToken, id)).email] as const)
        );
        setAuthorEmails(Object.fromEntries(emailEntries));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar el tema"))
      .finally(() => setLoading(false));
  }, [threadId, session]);

  async function handleDeletePost(postId: string) {
    if (!session || !threadId) return;
    if (!confirm("¿Seguro que quieres borrar esta publicación?")) return;
    try {
      await deletePost(session.idToken, threadId, postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar la publicación");
    }
  }

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    if (!session || !threadId || !reply.trim()) return;
    setSending(true);
    setError(null);
    try {
      const post = await createPost(session.idToken, threadId, reply.trim());
      setPosts((prev) => [...prev, post]);
      setAuthorEmails((prev) => ({ ...prev, [post.author_user_id]: session.email }));
      setReply("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar la respuesta");
    } finally {
      setSending(false);
    }
  }

  return (
    <PageLayout>
      <Link to={`/forum/${factionId}`} className="text-sm text-[var(--color-accent)] hover:underline">
        ← Volver al foro
      </Link>

      {loading ? (
        <p className="mt-6 text-[var(--color-text-muted)]">Cargando...</p>
      ) : error ? (
        <p className="mt-6 text-sm text-[var(--color-danger)]">{error}</p>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-3">
            {posts.map((post) => (
              <div key={post.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <p className="whitespace-pre-wrap">{post.text}</p>
                <div className="mt-2 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                  <span>
                    {authorEmails[post.author_user_id] ?? "..."} · {new Date(post.created_at).toLocaleString()}
                  </span>
                  {session?.userId === post.author_user_id && (
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-[var(--color-danger)] hover:underline"
                    >
                      Borrar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleReply} className="mt-6 flex flex-col gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder="Escribe una respuesta..."
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)]"
              required
            />
            <Button type="submit" className="self-start" disabled={sending}>
              Responder
            </Button>
          </form>
        </>
      )}
    </PageLayout>
  );
}
