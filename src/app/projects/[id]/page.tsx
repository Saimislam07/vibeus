"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import SocialActionBar from "@/components/SocialActionBar";
import CommentsDrawer from "@/components/CommentsDrawer";
import { parseTags, timeAgo } from "@/lib/utils";
import {
  FolderGit2,
  ExternalLink,
  Eye,
  Video,
  ArrowLeft,
  Calendar,
  Layers,
  Edit,
  Trash2,
  BadgeCheck,
  CheckCircle2,
  Maximize2,
  X,
  Share2,
} from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import type { ProjectItem } from "@/lib/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/projects/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Project not found");
        return res.json();
      })
      .then((data) => setProject(data.project))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/projects");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1 p-12 text-center text-slate-400">Loading project showcase...</main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1 p-12 text-center space-y-3">
          <h2 className="text-lg font-bold text-white">Project Not Found</h2>
          <p className="text-xs text-slate-400">
            This project may have been removed or made private.
          </p>
          <Link
            href="/projects"
            className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
          >
            Back to Showcase
          </Link>
        </main>
      </div>
    );
  }

  const tags = parseTags(project.techStack);
  const isAuthor = user?.id === project.user.id;
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="mx-auto max-w-7xl flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation back and author actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Projects</span>
          </Link>

          {(isAuthor || isAdmin) && (
            <div className="flex items-center gap-2">
              <Link
                href={`/projects/${project.id}/edit`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#141c2e] hover:bg-[#1f293d] border border-[#1f293d] text-xs font-medium text-slate-200 transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Project</span>
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs font-medium text-red-300 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Project Header Hero Card */}
        <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {project.category}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    project.status === "COMPLETED"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-950 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {project.status === "COMPLETED" ? "Completed & Live" : "In Progress"}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {project.viewsCount} views
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {project.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {project.summary}
              </p>
            </div>

            {/* Quick Action Links: Live Demo & Repo */}
            <div className="flex flex-row md:flex-col gap-2 shrink-0">
              {project.liveDemoUrl && (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-colors"
                >
                  <span>Visit Live Demo</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#141c2e] hover:bg-[#1b253b] border border-[#1f293d] text-slate-200 text-xs sm:text-sm font-medium transition-colors"
                >
                  <GithubIcon className="h-4 w-4" />
                  <span>GitHub Repository</span>
                </a>
              )}
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#1f293d]">
            <span className="text-xs font-semibold text-slate-400">Tech Stack:</span>
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#0b0f19] text-indigo-300 border border-[#1f293d]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Video Demo Player (if available) */}
        {project.demoVideoUrl && (
          <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Video className="h-4 w-4 text-indigo-400" />
              Project Demonstration Video
            </h3>
            <div className="rounded-xl overflow-hidden bg-black border border-[#1f293d] aspect-video max-h-[500px]">
              <video src={project.demoVideoUrl} controls className="w-full h-full object-contain" />
            </div>
          </div>
        )}

        {/* Screenshot Gallery Viewer */}
        {((project.screenshots && project.screenshots.length > 0) || project.thumbnailUrl) && (
          <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Visual Gallery & Interface
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {project.thumbnailUrl && (
                <div
                  onClick={() => setActiveScreenshot(project.thumbnailUrl ?? null)}
                  className="relative aspect-video rounded-xl overflow-hidden border border-[#1f293d] cursor-pointer group"
                >
                  <img
                    src={project.thumbnailUrl}
                    alt="Cover"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Maximize2 className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}

              {project.screenshots?.map((url: string, i: number) => (
                <div
                  key={i}
                  onClick={() => setActiveScreenshot(url)}
                  className="relative aspect-video rounded-xl overflow-hidden border border-[#1f293d] cursor-pointer group"
                >
                  <img
                    src={url}
                    alt={`Screenshot ${i + 1}`}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Maximize2 className="h-5 w-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Markdown/Text Technical Description */}
        <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Architecture, Implementation & Details
          </h3>
          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-3 font-sans">
            {project.description}
          </div>
        </div>

        {/* Creator Profile Card */}
        <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link href={`/profile/${project.user.username}`}>
              <img
                src={
                  project.user.avatarUrl ||
                  `https://api.dicebear.com/7.x/identicon/svg?seed=${project.user.username}`
                }
                alt={project.user.name}
                className="h-14 w-14 rounded-full object-cover border border-[#1f293d]"
              />
            </Link>
            <div>
              <Link
                href={`/profile/${project.user.username}`}
                className="text-base font-bold text-white hover:text-indigo-400 transition-colors flex items-center gap-1.5"
              >
                {project.user.name}
                {project.user.isVerified && (
                  <BadgeCheck className="h-4 w-4 text-indigo-400 fill-indigo-400/20" />
                )}
              </Link>
              <p className="text-xs text-slate-400">@{project.user.username}</p>
              <p className="text-xs text-slate-300 mt-1 line-clamp-1">{project.user.bio}</p>
            </div>
          </div>

          <Link
            href={`/profile/${project.user.username}`}
            className="px-4 py-2 rounded-xl bg-[#141c2e] hover:bg-[#1b253b] border border-[#1f293d] text-xs font-semibold text-slate-200 text-center transition-colors shrink-0"
          >
            View Developer Profile
          </Link>
        </div>

        {/* Social Action Bar (Strict Single Like, Comment Trigger, Share) */}
        <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-4 sm:p-5">
          <SocialActionBar
            targetId={project.id}
            targetType="PROJECT"
            likesCount={project.likesCount}
            commentsCount={project.commentsCount}
            hasLiked={project.hasLiked}
            hasBookmarked={project.hasBookmarked}
            shareTitle={`Explore ${project.title} on DevPulse`}
          />
        </div>

        {/* Project Comments Section */}
        <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Peer Feedback & Technical Discussion ({project.commentsCount})
          </h3>
          <CommentsDrawer targetId={project.id} targetType="PROJECT" />
        </div>
      </main>

      {/* Fullscreen Screenshot Modal */}
      {activeScreenshot && (
        <div
          onClick={() => setActiveScreenshot(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={activeScreenshot}
              alt="Enlarged screenshot"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setActiveScreenshot(null)}
              className="absolute -top-3 -right-3 p-1.5 rounded-full bg-black/80 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
