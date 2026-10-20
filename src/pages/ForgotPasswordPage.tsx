import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, confirmForgotPassword } from "../auth/cognitoClient";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el código");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await confirmForgotPassword(email, code, newPassword);
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo restablecer la contraseña");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await forgotPassword(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reenviar el código");
    }
  }

  if (step === "reset") {
    return (
      <AuthLayout title="Restablecer contraseña">
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">Te enviamos un código a {email}</p>
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Código de confirmación"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <Button type="submit" disabled={submitting}>
            Cambiar contraseña
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
    <AuthLayout title="¿Olvidaste tu contraseña?">
      <form onSubmit={handleRequest} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" disabled={submitting}>
          Enviar código
        </Button>
      </form>
      {error && <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>}
      <p className="mt-6 text-sm text-[var(--color-text-muted)]">
        <Link to="/login" className="text-[var(--color-accent)] hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
