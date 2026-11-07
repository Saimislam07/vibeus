"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Code2, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      setSubmitted(true);
      if (data.devResetToken) {
        setDevResetToken(data.devResetToken);
      }
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-[#0b0f19]">
      <div className="w-full max-w-md animate-fade-in space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-white">DevPulse</span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Recover your account</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter your email to receive an expiring, single-use password recovery link
          </p>
        </div>

        <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-6 sm:p-8 shadow-xl space-y-5">
          {submitted ? (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Check your email</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  If an account exists with <strong>{email}</strong>, we have dispatched a secure,
                  expiring password reset link.
                </p>
              </div>

              {/* Development testing preview link */}
              {devResetToken && (
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-left space-y-1 text-xs">
                  <p className="font-semibold text-indigo-300">Development Testing Shortcut:</p>
                  <p className="text-slate-400 text-[11px]">
                    Since this is local development, click below to test the reset flow directly:
                  </p>
                  <Link
                    href={`/reset-password?token=${devResetToken}`}
                    className="inline-block mt-1 font-semibold text-indigo-400 hover:underline break-all"
                  >
                    Click to Reset Password →
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 pt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300" htmlFor="forgot-email">
                  Your registered email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="developer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Recovery Link...</span>
                  </>
                ) : (
                  <span>Send Recovery Instructions</span>
                )}
              </button>

              <div className="text-center pt-2 border-t border-[#1f293d]">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
