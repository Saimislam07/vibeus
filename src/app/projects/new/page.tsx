"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import {
  FolderGit2,
  UploadCloud,
  X,
  Plus,
  Loader2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import type { CategoryItem } from "@/lib/types";

export default function NewProjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Applications");
  const [techStack, setTechStack] = useState("React, TypeScript, Next.js, Tailwind CSS");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [newScreenshotUrl, setNewScreenshotUrl] = useState("");
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [isVerticalVideo, setIsVerticalVideo] = useState(false);
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [status, setStatus] = useState("COMPLETED");
  const [createAnnouncementPost, setCreateAnnouncementPost] = useState(true);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error(err));
  }, []);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1 p-8 text-center space-y-4">
          <FolderGit2 className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Sign In Required</h2>
          <p className="text-sm text-slate-400">
            You must be logged in with a registered developer account to showcase a project.
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

  // Handle media upload
  const handleFileUpload = async (file: File, type: "THUMB" | "VIDEO") => {
    const formData = new FormData();
    formData.append("file", file);

    if (type === "THUMB") setUploadingThumb(true);
    else setUploadingVideo(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (type === "THUMB") {
          setThumbnailUrl(data.url);
        } else {
          setDemoVideoUrl(data.url);
          setIsVerticalVideo(true); // default to true for reels if uploaded
        }
      } else {
        const err = await res.json();
        alert(err.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      if (type === "THUMB") setUploadingThumb(false);
      else setUploadingVideo(false);
    }
  };

  const addScreenshot = () => {
    if (newScreenshotUrl.trim()) {
      setScreenshots([...screenshots, newScreenshotUrl.trim()]);
      setNewScreenshotUrl("");
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !summary.trim() || !description.trim()) {
      setError("Please provide title, summary, and description.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          description,
          category,
          techStack,
          thumbnailUrl,
          screenshots,
          demoVideoUrl,
          isVerticalVideo,
          liveDemoUrl,
          repoUrl,
          status,
          createAnnouncementPost,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit project");
      } else {
        router.push(`/projects/${data.project.id}`);
      }
    } catch (err) {
      console.error(err);
      setError("Network error publishing project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="p-2 rounded-lg bg-[#111827] border border-[#1f293d] text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Publish Project Showcase
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Share your software architecture, demo video, and code repository with the developer
              community.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs sm:text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
              1. Project Fundamentals
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300" htmlFor="p-title">
                  Project Title *
                </label>
                <input
                  id="p-title"
                  type="text"
                  required
                  placeholder="e.g. AcuityML: Zero-latency edge computer vision in WebAssembly"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300" htmlFor="p-category">
                  Category *
                </label>
                <select
                  id="p-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Web Applications">Web Applications</option>
                      <option value="Mobile Apps">Mobile Apps</option>
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="Developer Tools & CLIs">Developer Tools & CLIs</option>
                      <option value="Open Source Libraries">Open Source Libraries</option>
                      <option value="Games & Graphics">Games & Graphics</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300" htmlFor="p-status">
                  Development Status
                </label>
                <select
                  id="p-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="COMPLETED">Completed & Live</option>
                  <option value="IN_PROGRESS">In Active Development</option>
                  <option value="CONCEPT">Prototype / Experiment</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300" htmlFor="p-summary">
                  Short Hook / Elevator Pitch *
                </label>
                <input
                  id="p-summary"
                  type="text"
                  required
                  placeholder="One sentence describing what your project solves and its standout technical feature..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300" htmlFor="p-tech">
                  Tech Stack (Comma-separated)
                </label>
                <input
                  id="p-tech"
                  type="text"
                  placeholder="e.g. Next.js, TypeScript, WebAssembly, PyTorch, Tailwind CSS, Docker"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Media & Demonstrations */}
          <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
              2. Cover, Screenshots & Demo Video
            </h2>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Project Cover Thumbnail
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Enter image URL or upload below..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="file"
                  ref={thumbnailFileRef}
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileUpload(e.target.files[0], "THUMB")
                  }
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => thumbnailFileRef.current?.click()}
                  disabled={uploadingThumb}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#141c2e] hover:bg-[#1b253b] border border-[#1f293d] text-xs font-semibold text-slate-200 transition-colors shrink-0"
                >
                  {uploadingThumb ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                  <span>Upload Image</span>
                </button>
              </div>
              {thumbnailUrl && (
                <div className="h-32 w-52 rounded-xl overflow-hidden border border-[#1f293d] relative">
                  <img
                    src={thumbnailUrl}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl("")}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Video Demo & DevReels */}
            <div className="space-y-2 pt-2 border-t border-[#1f293d]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-indigo-400" />
                  Demo Video (MP4 / WebM video URL or upload)
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="https://.../video.mp4"
                  value={demoVideoUrl}
                  onChange={(e) => setDemoVideoUrl(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="file"
                  ref={videoFileRef}
                  accept="video/mp4,video/webm"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileUpload(e.target.files[0], "VIDEO")
                  }
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoFileRef.current?.click()}
                  disabled={uploadingVideo}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#141c2e] hover:bg-[#1b253b] border border-[#1f293d] text-xs font-semibold text-slate-200 transition-colors shrink-0"
                >
                  {uploadingVideo ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  ) : (
                    <Video className="h-4 w-4 text-indigo-400" />
                  )}
                  <span>Upload Video</span>
                </button>
              </div>

              {demoVideoUrl && (
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-indigo-200">
                    <input
                      type="checkbox"
                      checked={isVerticalVideo}
                      onChange={(e) => setIsVerticalVideo(e.target.checked)}
                      className="h-4 w-4 rounded border-indigo-400 bg-indigo-950 text-indigo-600 focus:ring-0"
                    />
                    <span className="font-semibold">Feature in DevReels Vertical Video Stream</span>
                  </label>
                </div>
              )}
            </div>

            {/* Screenshots Gallery URLs */}
            <div className="space-y-2 pt-2 border-t border-[#1f293d]">
              <label className="text-xs font-semibold text-slate-300">
                Additional Screenshot Gallery
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter screenshot image URL..."
                  value={newScreenshotUrl}
                  onChange={(e) => setNewScreenshotUrl(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={addScreenshot}
                  className="px-3 py-2 rounded-xl bg-[#141c2e] hover:bg-[#1b253b] text-xs font-semibold text-slate-200"
                >
                  + Add Screenshot
                </button>
              </div>

              {screenshots.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {screenshots.map((url, i) => (
                    <div
                      key={i}
                      className="relative h-16 w-24 rounded-lg overflow-hidden border border-[#1f293d]"
                    >
                      <img
                        src={url}
                        alt={`Screenshot ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(i)}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Detailed Description */}
          <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
              3. Technical Deep-Dive & Architecture
            </h2>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300" htmlFor="p-desc">
                Full Description (Markdown or formatted text) *
              </label>
              <textarea
                id="p-desc"
                rows={8}
                required
                placeholder="Explain the problem this project solves, system architecture, performance benchmarks, key challenges faced, and how other developers can run it..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Section 4: External Links */}
          <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
              4. Code Repository & Live Deployment
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300" htmlFor="p-demo">
                  Live Demo URL
                </label>
                <input
                  id="p-demo"
                  type="url"
                  placeholder="https://myproject.dev"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300" htmlFor="p-repo">
                  GitHub / Source Code Repository URL
                </label>
                <input
                  id="p-repo"
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#1f293d]">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={createAnnouncementPost}
                  onChange={(e) => setCreateAnnouncementPost(e.target.checked)}
                  className="h-4 w-4 rounded border-[#1f293d] bg-[#0b0f19] text-indigo-600 focus:ring-0"
                />
                <span>Automatically share a launch announcement post to the community feed</span>
              </label>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/projects"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploadingThumb || uploadingVideo}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publishing Showcase...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Publish Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
