import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp, confirmSignUp, resendConfirmationCode } from "../auth/cognitoClient";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";

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
      <AuthLayout title="Confirma tu correo">
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">Te enviamos un código a {email}</p>
        <form onSubmit={handleConfirm} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Código de confirmación"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <Button type="submit" disabled={submitting}>
            Confirmar
          </Button>
        </form>
        <Button type="button" variant="secondary" onClick={handleResend} className="mt-3 w-full">
          Reenviar código
        </Button>
        {error && <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Registro">
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <Button type="submit" disabled={submitting}>
          Registrarme
        </Button>
      </form>
      {error && <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>}
      <p className="mt-6 text-sm text-[var(--color-text-muted)]">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-[var(--color-accent)] hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
