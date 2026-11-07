"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Code2, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuccess(true);
          setMessage("Your email has been verified. You now have a verified developer badge!");
        } else {
          setSuccess(false);
          setMessage(data.error || "Failed to verify email token.");
        }
      })
      .catch((err) => {
        console.error(err);
        setSuccess(false);
        setMessage("Network error verifying email.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div className="w-full max-w-md animate-fade-in space-y-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
            <Code2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-white">DevPulse</span>
        </Link>
        <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-8 shadow-xl">
          <p className="text-xs text-red-300">No verification token provided in URL.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-fade-in space-y-6 text-center">
      <Link href="/" className="inline-flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
          <Code2 className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold text-white">DevPulse</span>
      </Link>

      <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-8 shadow-xl space-y-4">
        {loading ? (
          <div className="py-8 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
            <p className="text-xs text-slate-400">Verifying your developer credentials...</p>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Email Verified Successfully</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                <span>Enter Community Feed</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <XCircle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Verification Failed</h2>
            <p className="text-xs text-red-300 leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-4 py-2 rounded-xl bg-[#141c2e] text-white text-xs font-semibold"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#0b0f19]">
      <Suspense fallback={<div className="text-slate-400 text-xs">Loading verification...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
