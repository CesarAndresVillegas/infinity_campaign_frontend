import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";

export default function NotFoundPage() {
  return (
    <PageLayout>
      <h1 className="text-2xl font-bold">404 — Página no encontrada</h1>
      <p className="mt-3 text-[var(--color-text-muted)]">
        La página que buscas no existe o fue movida.
      </p>
      <Link to="/" className="mt-6 inline-block text-[var(--color-accent)] hover:underline">
        Volver al mapa
      </Link>
    </PageLayout>
  );
}
