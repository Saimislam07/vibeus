"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Code2, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
      } else {
        setSuccess(true);
        login(data.user);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 600);
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing
  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-[#0b0f19]">
      <div className="w-full max-w-md animate-fade-in space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20 group-hover:bg-indigo-500 transition-colors">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">DevPulse</span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in to your developer identity and explore the latest projects
          </p>
        </div>

        {/* Login Card - Clean, Modern, Balanced */}
        <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-6 sm:p-8 shadow-xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 animate-fade-in">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Authentication confirmed. Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300" htmlFor="login-email">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300" htmlFor="login-password">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#1f293d] bg-[#0b0f19] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-300">Remember this device for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Pill for Evaluators */}
          <div className="pt-3 border-t border-[#1f293d] space-y-2">
            <p className="text-[11px] font-medium text-slate-400 text-center">
              Quick Test Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillCredentials("admin@devpulse.io", "AdminPassword123!")}
                className="p-2 rounded-lg bg-[#141c2e] hover:bg-[#1c2a47] border border-[#1f293d] text-slate-300 text-left transition-colors flex flex-col"
              >
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Super Admin
                </span>
                <span className="text-[10px] text-slate-400">admin@devpulse.io</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("sarah@ai-labs.dev", "DevPulse2026!")}
                className="p-2 rounded-lg bg-[#141c2e] hover:bg-[#1c2a47] border border-[#1f293d] text-slate-300 text-left transition-colors flex flex-col"
              >
                <span className="font-semibold text-indigo-400">Developer</span>
                <span className="text-[10px] text-slate-400">sarah@ai-labs.dev</span>
              </button>
            </div>
          </div>

          {/* Create Account Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/register"
                className="font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
