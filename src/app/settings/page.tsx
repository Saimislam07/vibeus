"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, type User as AuthUser } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import {
  Settings,
  User,
  Shield,
  Lock,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  UploadCloud,
} from "lucide-react";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1 p-12 text-center text-slate-400">
          Please sign in to access settings.
        </main>
      </div>
    );
  }

  return <SettingsForm key={user.id} user={user} />;
}

function SettingsForm({ user }: { user: AuthUser }) {
  const { refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "privacy" | "security">("profile");

  // Profile Form States
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [coverUrl, setCoverUrl] = useState(user.coverUrl || "");
  const [district, setDistrict] = useState(user.district || "");
  const [country, setCountry] = useState(user.country || "");
  const [skills, setSkills] = useState(user.skills || "");
  const [experienceLevel, setExperienceLevel] = useState(user.experienceLevel || "");
  const [learningGoals, setLearningGoals] = useState(user.learningGoals || "");
  const [githubUrl, setGithubUrl] = useState(user.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user.portfolioUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || "");
  const [twitterUrl, setTwitterUrl] = useState(user.twitterUrl || "");

  // Privacy States
  const [isProfilePublic, setIsProfilePublic] = useState(user.isProfilePublic !== false);
  const [showEmail, setShowEmail] = useState(Boolean(user.showEmail));

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Status
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          avatarUrl,
          coverUrl,
          district,
          country,
          skills,
          experienceLevel,
          learningGoals,
          githubUrl,
          portfolioUrl,
          linkedinUrl,
          twitterUrl,
          isProfilePublic,
          showEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update profile");
      } else {
        setMessage("Profile updated successfully!");
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/users/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password");
      } else {
        setMessage("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-400" />
            Account & Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your public identity, developer credentials, and security preferences.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#1f293d] pb-2 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => {
              setActiveTab("profile");
              setMessage(null);
              setError(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === "profile"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Developer Profile</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("privacy");
              setMessage(null);
              setError(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === "privacy"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Privacy & Visibility</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("security");
              setMessage(null);
              setError(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors ${
              activeTab === "security"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Password & Security</span>
          </button>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs sm:text-sm text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs sm:text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Tab 1: Profile Form */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                Identity & Bio
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Experience Level</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Backend Engineer (6 yrs)"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Biography</label>
                  <textarea
                    rows={3}
                    placeholder="Tell the community what you build and what you are passionate about..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Technical Skills & Frameworks (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TypeScript, React, Next.js, Rust, Docker, PostgreSQL"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Current Learning Goals
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WebGPU compute shaders, eBPF telemetry, distributed consensus"
                    value={learningGoals}
                    onChange={(e) => setLearningGoals(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Home District / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco or Berlin"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Media URLs */}
            <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                Avatar & Cover Photos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Avatar Image URL</label>
                  <input
                    type="text"
                    placeholder="https://.../avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Cover Banner Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://.../cover.jpg"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* External Developer Links */}
            <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                Public Social & Portfolio Links
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">GitHub Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Portfolio / Personal Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://mywebsite.dev"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Twitter / X URL</label>
                  <input
                    type="url"
                    placeholder="https://x.com/username"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-sm"
              >
                {saving ? "Saving Profile..." : "Save Profile Changes"}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Privacy Settings */}
        {activeTab === "privacy" && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                Privacy & Visibility Controls
              </h3>

              <div className="space-y-4 pt-2">
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0b0f19] border border-[#1f293d] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isProfilePublic}
                    onChange={(e) => setIsProfilePublic(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#1f293d] bg-[#111827] text-indigo-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-sm text-white block">
                      Public Developer Profile
                    </span>
                    <span className="text-xs text-slate-400">
                      When enabled, your profile and showcase projects appear in the Explore
                      directory and search results.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0b0f19] border border-[#1f293d] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEmail}
                    onChange={(e) => setShowEmail(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#1f293d] bg-[#111827] text-indigo-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-sm text-white block">
                      Display Email on Profile
                    </span>
                    <span className="text-xs text-slate-400">
                      Allow other logged-in developers to see your email address on your public
                      profile.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-sm"
              >
                {saving ? "Updating Privacy..." : "Save Privacy Preferences"}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                Change Password
              </h3>

              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Current Password</label>
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    New Password (min. 6 characters)
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Confirm New Password
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  {showPass ? "Hide passwords" : "Show passwords"}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-sm"
              >
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
