import PageLayout from "../components/PageLayout";

export default function HomePage() {
  return (
    <PageLayout>
      <h1 className="text-2xl font-bold">Bienvenido a la campaña</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        Pronto vas a poder ver el mapa mundial y reportar tus partidas desde aquí.
      </p>
    </PageLayout>
  );
}
