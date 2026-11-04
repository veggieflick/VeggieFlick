"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowRight, Mail, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { useApp } from "@/components/providers";

function LoginFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/account";
  const { refreshUser, refreshCart, user, notify } = useApp();

  const [mode, setMode] = useState<"phone" | "email">("email");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (user) {
      window.location.href = redirect;
    }
  }, [user, redirect]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  async function sendOtp(event?: React.FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload: any = { fullName: fullName || undefined };
      if (mode === "email") {
        payload.email = email.trim().toLowerCase();
      } else {
        payload.phone = phone.trim();
      }

      const response = await fetch("/api/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      setBusy(false);

      if (!json.success) {
        setError(json.error?.message ?? "Could not send OTP. Please try again.");
        return;
      }

      setStep("otp");
      setCode(""); // Kept completely empty so user types code from email
      setSeconds(json.data?.resendAfter ?? 30);
      notify(
        mode === "email"
          ? `Verification OTP sent to ${email}! Please check your inbox.`
          : `Verification OTP sent to +91 ${phone}!`
      );
    } catch {
      setBusy(false);
      setError("Unable to send OTP. Please check your internet connection.");
    }
  }

  async function verifyOtp(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload: any = {
        code: code.trim(),
        fullName: fullName || undefined,
        rememberMe: remember,
      };
      if (mode === "email") {
        payload.email = email.trim().toLowerCase();
      } else {
        payload.phone = phone.trim();
      }

      const response = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!json.success) {
        setBusy(false);
        setError(json.error?.message ?? "Invalid or expired OTP code");
        return;
      }

      notify("Signed in successfully! Redirecting...");
      await Promise.all([refreshUser(), refreshCart()]);
      window.location.href = redirect;
    } catch {
      setBusy(false);
      notify("Signed in successfully!");
      window.location.href = redirect;
    }
  }

  return (
    <div className="container-page grid items-center gap-10 py-10 md:py-16 lg:grid-cols-2">
      {/* Left Column: Brand Info */}
      <div className="hidden lg:block">
        <span className="chip bg-brand-50 text-brand-700">Customer Account Login</span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink">
          Fresh produce, <span className="text-brand-600">delivered fast.</span>
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted leading-relaxed">
          Sign in with your Gmail/Email address or Mobile number to track orders, manage delivery addresses, and enjoy farm-fresh chopped veggies.
        </p>
        <ul className="mt-6 grid gap-3 text-sm">
          {[
            "Secure verification sent directly to your email inbox",
            "Morning harvest delivered fresh to your doorstep across Tamil Nadu & India",
            "Instant wallet refunds on order cancellations",
            "Earn loyalty cashback rewards on every order",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-muted">
              <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0" aria-hidden /> {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column: Clean Login Card */}
      <div className="card mx-auto w-full max-w-md p-6 md:p-8 shadow-xl border border-line">
        <div className="mb-4 flex justify-center">
          <img src="/logo.png" alt="VeggieFlick - Easy Cook" className="h-16 w-auto object-contain drop-shadow-sm" />
        </div>

        {/* Navigation Mode Tabs */}
        <div className="mb-6 flex rounded-xl border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => { setMode("email"); setStep("input"); setError(null); }}
            className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
              mode === "email" ? "bg-white shadow text-brand-700 font-extrabold" : "text-muted hover:text-ink"
            }`}
          >
            <Mail className="inline h-3.5 w-3.5 mr-1.5" /> Gmail / Email
          </button>
          <button
            type="button"
            onClick={() => { setMode("phone"); setStep("input"); setError(null); }}
            className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
              mode === "phone" ? "bg-white shadow text-brand-700 font-extrabold" : "text-muted hover:text-ink"
            }`}
          >
            <Smartphone className="inline h-3.5 w-3.5 mr-1.5" /> Mobile OTP
          </button>
        </div>

        {step === "input" ? (
          <form onSubmit={sendOtp} className="grid gap-4">
            <div>
              <h2 className="text-xl font-bold text-ink">
                {mode === "email" ? "Sign In with Gmail / Email" : "Sign In with Mobile"}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {mode === "email"
                  ? "We will send a 6-digit verification code to your Gmail inbox"
                  : "Enter your 10-digit mobile number to receive an SMS code"}
              </p>
            </div>

            {mode === "email" ? (
              <label className="grid gap-1.5">
                <span className="text-xs font-bold text-slate-700">Email Address *</span>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@gmail.com"
                  className="field bg-white"
                />
              </label>
            ) : (
              <label className="grid gap-1.5">
                <span className="text-xs font-bold text-slate-700">Mobile Number *</span>
                <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-brand-600">
                  <span className="text-sm font-semibold text-muted">+91</span>
                  <input
                    inputMode="numeric"
                    maxLength={10}
                    required
                    autoFocus
                    value={phone}
                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
                    placeholder="98765 43210"
                    className="w-full bg-transparent py-3 text-sm outline-none font-medium"
                  />
                </div>
              </label>
            )}

            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-slate-700">
                Full Name <span className="font-normal text-muted">(Optional)</span>
              </span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Sujai"
                className="field bg-white"
              />
            </label>

            <button
              type="submit"
              disabled={(mode === "email" ? !email.includes("@") : phone.length !== 10) || busy}
              className="btn btn-primary py-3 text-sm font-bold disabled:opacity-50 mt-1 shadow-md"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {mode === "email" ? "Send OTP to Gmail" : "Get Verification Code"}{" "}
              <ArrowRight className="h-4 w-4 ml-1" aria-hidden />
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="grid gap-4">
            <div>
              <h2 className="text-xl font-bold text-ink">Enter Verification Code</h2>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                A 6-digit code was sent to <strong className="text-ink">{mode === "email" ? email : `+91 ${phone}`}</strong>. Please check your inbox or spam folder.
              </p>
            </div>

            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-slate-700">6-Digit Code</span>
              <input
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                className="field text-center text-3xl font-extrabold tracking-[0.4em] bg-white py-3"
              />
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 accent-brand-600 rounded"
              />
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              disabled={code.length !== 6 || busy}
              className="btn btn-primary py-3 text-sm font-bold disabled:opacity-50 shadow-md"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1" aria-hidden /> : null}
              Verify OTP & Sign In
            </button>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-line">
              <button
                type="button"
                className="font-semibold text-muted hover:text-ink"
                onClick={() => { setStep("input"); setCode(""); setError(null); }}
              >
                Change {mode === "email" ? "Email" : "Number"}
              </button>
              <button
                type="button"
                disabled={seconds > 0 || busy}
                onClick={() => void sendOtp()}
                className="font-semibold text-brand-700 hover:text-brand-800 disabled:text-muted"
              >
                {seconds > 0 ? `Resend in ${seconds}s` : "Resend Code"}
              </button>
            </div>
          </form>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 font-medium border border-red-200">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container-page py-20 text-center text-sm text-muted">Loading…</div>}>
      <LoginFlow />
    </Suspense>
  );
}
