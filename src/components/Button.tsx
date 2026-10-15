import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[#06111a] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      {...props}
      className={`rounded-md px-4 py-2 font-medium transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
