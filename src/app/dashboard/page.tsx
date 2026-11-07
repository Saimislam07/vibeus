"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import ProjectCard from "@/components/ProjectCard";
import PostCard from "@/components/PostCard";
import type { PostItem, ProjectItem } from "@/lib/types";
import {
  Layers,
  FolderGit2,
  MessageSquare,
  Bookmark,
  Users2,
  Settings,
  PlusCircle,
  Loader2,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";

function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "projects";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [myProjects, setMyProjects] = useState<ProjectItem[]>([]);
  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [savedProjects, setSavedProjects] = useState<ProjectItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      fetch(`/api/projects?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/posts?userId=${user.id}`).then((r) => r.json()),
      fetch("/api/bookmarks").then((r) => r.json()),
    ])
      .then(([projData, postData, bookData]) => {
        setMyProjects(projData.projects || []);
        setMyPosts(postData.posts || []);
        setSavedProjects(bookData.projects || []);
        setSavedPosts(bookData.posts || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1 p-16 text-center space-y-4">
          <Layers className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Sign In Required</h2>
          <p className="text-sm text-slate-400">
            Please sign in to access your personal developer dashboard.
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
          >
            Sign In Now
          </Link>
        </main>
      </div>
    );
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMyProjects(myProjects.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Layers className="h-6 w-6 text-indigo-400" />
              Developer Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage your published projects, community discussions, and saved technical articles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/projects/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Project</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141c2e] hover:bg-[#1b253b] border border-[#1f293d] text-slate-200 text-xs font-medium transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#1f293d] pb-2 text-xs sm:text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl shrink-0 transition-colors ${
              activeTab === "projects"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            <FolderGit2 className="h-4 w-4" />
            <span>My Projects ({myProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl shrink-0 transition-colors ${
              activeTab === "posts"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>My Posts ({myPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl shrink-0 transition-colors ${
              activeTab === "saved"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Saved Bookmarks ({savedProjects.length + savedPosts.length})</span>
          </button>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
            <p className="text-xs text-slate-400">Loading your developer activity...</p>
          </div>
        ) : activeTab === "projects" ? (
          myProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1f293d] p-12 text-center space-y-3">
              <FolderGit2 className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-white">
                You haven&apos;t published any projects yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Showcase your applications, developer tools, or open-source libraries to gain peer
                feedback.
              </p>
              <Link
                href="/projects/new"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Publish Your First Project
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {proj.thumbnailUrl && (
                      <img
                        src={proj.thumbnailUrl}
                        alt={proj.title}
                        className="h-16 w-24 rounded-xl object-cover shrink-0 border border-[#1f293d]"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/projects/${proj.id}`}
                          className="font-bold text-base text-white hover:text-indigo-400"
                        >
                          {proj.title}
                        </Link>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300">
                          {proj.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-1">{proj.summary}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                        <span>{proj.viewsCount} views</span>
                        <span>•</span>
                        <span>{proj.likesCount} likes</span>
                        <span>•</span>
                        <span>{proj.commentsCount} comments</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/projects/${proj.id}`}
                      className="p-2 rounded-lg bg-[#141c2e] hover:bg-[#1f293d] text-slate-300 hover:text-white"
                      title="View Showcase"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/projects/${proj.id}/edit`}
                      className="p-2 rounded-lg bg-[#141c2e] hover:bg-[#1f293d] text-slate-300 hover:text-white"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === "posts" ? (
          myPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1f293d] p-12 text-center text-slate-400 text-sm">
              You haven&apos;t created any community posts yet.
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {myPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={(id) => setMyPosts(myPosts.filter((p) => p.id !== id))}
                />
              ))}
            </div>
          )
        ) : (
          /* Saved / Bookmarks Tab */
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Saved Projects ({savedProjects.length})
              </h3>
              {savedProjects.length === 0 ? (
                <p className="text-xs text-slate-500">No saved projects yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedProjects.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#1f293d]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Saved Posts ({savedPosts.length})
              </h3>
              {savedPosts.length === 0 ? (
                <p className="text-xs text-slate-500">No saved posts yet.</p>
              ) : (
                <div className="space-y-4 max-w-3xl">
                  {savedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={<div className="p-12 text-center text-slate-400">Loading dashboard...</div>}
    >
      <DashboardContent />
    </Suspense>
  );
}
