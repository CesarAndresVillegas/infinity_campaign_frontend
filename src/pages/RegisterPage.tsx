import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp, confirmSignUp, resendConfirmationCode } from "../auth/cognitoClient";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"register" | "confirm">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUp(email, password);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el usuario");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await confirmSignUp(email, code);
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await resendConfirmationCode(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reenviar el código");
    }
  }

  if (step === "confirm") {
    return (
      <div>
        <h1>Confirma tu correo</h1>
        <p>Te enviamos un código a {email}</p>
        <form onSubmit={handleConfirm}>
          <input
            type="text"
            placeholder="Código de confirmación"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button type="submit" disabled={submitting}>
            Confirmar
          </button>
        </form>
        <button type="button" onClick={handleResend}>
          Reenviar código
        </button>
        {error && <p role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <h1>Registro</h1>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <button type="submit" disabled={submitting}>
          Registrarme
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
