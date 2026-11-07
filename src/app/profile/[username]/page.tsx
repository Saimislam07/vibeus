"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import ProjectCard from "@/components/ProjectCard";
import PostCard from "@/components/PostCard";
import { parseTags } from "@/lib/utils";
import {
  UserCircle,
  MapPin,
  Calendar,
  Globe,
  FolderGit2,
  MessageSquare,
  Users2,
  Edit,
  BadgeCheck,
  UserPlus,
  Check,
  ShieldAlert,
  Loader2,
  Mail,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/Icons";
import type { DeveloperProfile, PostItem, ProjectItem } from "@/lib/types";

export default function UserProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const username = params?.username as string;

  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "posts">("projects");
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<string>("NONE");

  useEffect(() => {
    if (!username) return;

    let active = true;
    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/users/${username}`);
        if (res.ok) {
          const data = await res.json();
          if (!active) return;
          setProfile(data.profile);
          setConnectionStatus(data.profile.connectionStatus);
          setContentLoading(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, [username]);

  // Fetch user projects or posts
  useEffect(() => {
    if (!profile) return;
    if (activeTab === "projects") {
      fetch(`/api/projects?userId=${profile.id}`)
        .then((res) => res.json())
        .then((data) => setProjects(data.projects || []))
        .catch((err) => console.error(err))
        .finally(() => setContentLoading(false));
    } else {
      fetch(`/api/posts?userId=${profile.id}`)
        .then((res) => res.json())
        .then((data) => setPosts(data.posts || []))
        .catch((err) => console.error(err))
        .finally(() => setContentLoading(false));
    }
  }, [profile, activeTab]);

  const handleTabChange = (tab: "projects" | "posts") => {
    setContentLoading(true);
    setActiveTab(tab);
  };

  const handleConnectionAction = async () => {
    if (!profile) return;
    if (!currentUser) {
      alert("Sign in to connect with developers.");
      return;
    }

    try {
      if (connectionStatus === "NONE") {
        const res = await fetch("/api/connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId: profile.id }),
        });
        if (res.ok) setConnectionStatus("PENDING_SENT");
      } else if (connectionStatus === "CONNECTED" || connectionStatus === "PENDING_SENT") {
        if (!confirm("Are you sure you want to remove this connection?")) return;
        if (profile.connectionId) {
          await fetch(`/api/connections/${profile.connectionId}`, { method: "DELETE" });
          setConnectionStatus("NONE");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1 p-16 text-center text-slate-400">Loading developer profile...</main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1 p-16 text-center space-y-3">
          <h2 className="text-lg font-bold text-white">Developer Not Found</h2>
          <p className="text-xs text-slate-400">
            The requested profile @{username} does not exist.
          </p>
          <Link
            href="/explore"
            className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
          >
            Explore Developers
          </Link>
        </main>
      </div>
    );
  }

  const skills = parseTags(profile.skills);
  const isSelf = currentUser?.id === profile.id;

  return (
    <div className="mx-auto max-w-7xl flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Cover Photo & Header Card */}
        <div className="rounded-2xl border border-[#1f293d] bg-[#111827] overflow-hidden shadow-sm">
          {/* Cover Photo */}
          <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-indigo-950 via-slate-900 to-[#141c2e] relative">
            {profile.coverUrl && (
              <img
                src={profile.coverUrl}
                alt="Profile Cover"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Profile Identity Bar */}
          <div className="px-5 sm:px-8 pb-6 sm:pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
              {/* Avatar */}
              <div className="relative inline-block">
                <img
                  src={
                    profile.avatarUrl ||
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`
                  }
                  alt={profile.name}
                  className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl object-cover border-4 border-[#111827] shadow-xl bg-[#0b0f19]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {isSelf ? (
                  <Link
                    href="/settings"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141c2e] hover:bg-[#1b253b] border border-[#1f293d] text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Profile</span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleConnectionAction}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                        connectionStatus === "CONNECTED"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-red-950/40 hover:text-red-300"
                          : connectionStatus === "PENDING_SENT"
                            ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white"
                      }`}
                    >
                      {connectionStatus === "CONNECTED" ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Connected</span>
                        </>
                      ) : connectionStatus === "PENDING_SENT" ? (
                        <span>Request Pending</span>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/messages?userId=${profile.id}`}
                      className="px-4 py-2 rounded-xl bg-[#141c2e] hover:bg-[#1b253b] border border-[#1f293d] text-xs font-semibold text-slate-200 transition-colors"
                    >
                      Message
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {profile.name}
                  </h1>
                  {profile.isVerified && (
                    <BadgeCheck className="h-5 w-5 text-indigo-400 fill-indigo-400/20" />
                  )}
                  {profile.role === "ADMIN" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Super Admin
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-400">@{profile.username}</p>
                {profile.experienceLevel && (
                  <p className="text-xs font-medium text-indigo-400 mt-0.5">
                    {profile.experienceLevel}
                  </p>
                )}
              </div>

              {profile.bio && (
                <p className="text-sm text-slate-200 leading-relaxed max-w-2xl whitespace-pre-line">
                  {profile.bio}
                </p>
              )}

              {/* Meta details & Social links */}
              <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400 pt-1">
                {(profile.district || profile.country) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{[profile.district, profile.country].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-1 text-slate-300">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{profile.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-indigo-300 font-semibold">
                  <Users2 className="h-3.5 w-3.5" />
                  <span>{profile.connectionsCount} Connections</span>
                </div>
              </div>

              {/* External URLs */}
              <div className="flex items-center gap-3 pt-2">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
                    title="GitHub"
                  >
                    <GithubIcon className="h-4 w-4" />
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
                    title="Portfolio Website"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
                    title="LinkedIn"
                  >
                    <LinkedinIcon className="h-4 w-4" />
                  </a>
                )}
                {profile.twitterUrl && (
                  <a
                    href={profile.twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
                    title="Twitter / X"
                  >
                    <TwitterIcon className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Skills Tags */}
              {skills.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-400 mb-2">
                    Technical Skills & Tools:
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#0b0f19] text-indigo-300 border border-[#1f293d]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content Tabs (Projects vs Posts) */}
        <div className="flex items-center gap-2 border-b border-[#1f293d] pb-2 text-sm font-semibold">
          <button
            onClick={() => handleTabChange("projects")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              activeTab === "projects"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            <FolderGit2 className="h-4 w-4" />
            <span>Showcase Projects ({profile._count?.projects || 0})</span>
          </button>
          <button
            onClick={() => handleTabChange("posts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              activeTab === "posts"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Community Posts ({profile._count?.posts || 0})</span>
          </button>
        </div>

        {/* Content Tab View */}
        {contentLoading ? (
          <div className="py-12 text-center text-slate-400">Loading {activeTab}...</div>
        ) : activeTab === "projects" ? (
          projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1f293d] p-12 text-center text-slate-400 text-sm">
              No projects showcased yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1f293d] p-12 text-center text-slate-400 text-sm">
            No community posts yet.
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
