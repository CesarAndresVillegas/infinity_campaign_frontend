import type { ReactNode } from "react";

export default function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-xl shadow-black/40">
        <h1 className="mb-6 text-2xl font-bold text-[var(--color-accent)]">{title}</h1>
        {children}
      </div>
    </div>
  );
}
