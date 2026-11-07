"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [techStack, setTechStack] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [isVerticalVideo, setIsVerticalVideo] = useState(false);
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [status, setStatus] = useState("COMPLETED");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.project) {
          const p = data.project;
          setTitle(p.title);
          setSummary(p.summary);
          setDescription(p.description);
          setCategory(p.category);
          setTechStack(p.techStack);
          setThumbnailUrl(p.thumbnailUrl || "");
          setDemoVideoUrl(p.demoVideoUrl || "");
          setIsVerticalVideo(Boolean(p.isVerticalVideo));
          setLiveDemoUrl(p.liveDemoUrl || "");
          setRepoUrl(p.repoUrl || "");
          setStatus(p.status || "COMPLETED");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          description,
          category,
          techStack,
          thumbnailUrl,
          demoVideoUrl,
          isVerticalVideo,
          liveDemoUrl,
          repoUrl,
          status,
        }),
      });

      if (res.ok) {
        router.push(`/projects/${id}`);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to update project");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1 p-12 text-center text-slate-400">Loading project editor...</main>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${id}`}
            className="p-2 rounded-lg bg-[#111827] border border-[#1f293d] text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Edit Project</h1>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Project Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="COMPLETED">Completed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CONCEPT">Concept / Prototype</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Short Summary</label>
              <input
                type="text"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Tech Stack (comma-separated)
              </label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Thumbnail Cover Image URL
              </label>
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Demo Video URL</label>
              <input
                type="text"
                value={demoVideoUrl}
                onChange={(e) => setDemoVideoUrl(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Technical Description</label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Live Demo URL</label>
                <input
                  type="url"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">GitHub Repo URL</label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href={`/projects/${id}`}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
