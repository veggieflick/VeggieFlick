"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useApp } from "@/components/providers";

export default function AdminLoginPage() {
  const router = useRouter();
  const { refreshUser } = useApp();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const response = await fetch("/api/v1/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: identifier, password, totp: totp || undefined }),
    });
    const json = await response.json();
    setBusy(false);
    if (!json.success) {
      setError(json.error?.message ?? "Sign in failed");
      return;
    }
    await refreshUser();
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md rounded-[20px] bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Image src="/logo.png" alt="VeggieFlick Logo" width={48} height={48} className="h-12 w-auto object-contain" />
          <div>
            <h1 className="text-xl font-bold">VeggieFlick Super Admin</h1>
            <p className="text-xs text-muted">Authorized administrative access only</p>
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold">Username or Email</span>
            <input
              type="text"
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Username or admin email"
              className="field"
              autoComplete="username"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="field"
              autoComplete="current-password"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold">
              2FA code <span className="font-normal text-muted">(if enabled)</span>
            </span>
            <input
              inputMode="numeric"
              maxLength={6}
              value={totp}
              onChange={(event) => setTotp(event.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="field"
            />
          </label>

          <button type="submit" disabled={busy} className="btn btn-primary py-3 text-sm disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <KeyRound className="h-4 w-4" aria-hidden />}
            Sign in securely
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs text-slate-500 text-center">
          <p className="flex items-center justify-center gap-1.5 font-semibold text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> Super Admin Portal
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Strictly restricted to authorized Super Admin.</p>
        </div>
      </div>
    </div>
  );
}
