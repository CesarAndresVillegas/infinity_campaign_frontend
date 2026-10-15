import { useAuth } from "../auth/AuthContext";

export default function HomePage() {
  const { session, signOut } = useAuth();

  return (
    <div>
      <h1>Infinity Campaign</h1>
      <p>Sesión iniciada como {session?.email}</p>
      <button type="button" onClick={signOut}>
        Cerrar sesión
      </button>
    </div>
  );
}
