"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { parseTags } from "@/lib/utils";
import CommentsDrawer from "@/components/CommentsDrawer";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  ExternalLink,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Check,
  Copy,
  FolderGit2,
  BadgeCheck,
} from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import type { ProjectItem } from "@/lib/types";

export default function ReelsPage() {
  const { user } = useAuth();
  const [reels, setReels] = useState<ProjectItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Video playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Social interactions
  const [showComments, setShowComments] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/reels")
      .then((res) => res.json())
      .then((data) => {
        if (data.reels) setReels(data.reels);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const currentReel = reels[currentIndex];

  const goToNext = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      setShowComments(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, reels.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setShowComments(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Keyboard navigation (ArrowUp, ArrowDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComments) return; // allow typing in comments
      if (e.key === "ArrowDown" || e.key === "j") {
        goToNext();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        goToPrev();
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m") {
        setIsMuted(!isMuted);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, goToNext, goToPrev, reels.length, showComments, isMuted, togglePlay]);

  // Video autoplay when index changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay policy handled by muted
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  }, [currentIndex]);

  // Like Toggle (Strict single Like)
  const handleLikeToggle = async () => {
    if (!user) {
      alert("Please sign in to like this project video.");
      return;
    }
    if (!currentReel) return;

    const previousLiked = currentReel.hasLiked;
    const previousCount = currentReel.likesCount;

    // Optimistic
    const updated = [...reels];
    updated[currentIndex] = {
      ...currentReel,
      hasLiked: !previousLiked,
      likesCount: previousLiked ? previousCount - 1 : previousCount + 1,
    };
    setReels(updated);

    try {
      const res = await fetch(`/api/projects/${currentReel.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        updated[currentIndex] = {
          ...currentReel,
          hasLiked: data.liked,
          likesCount: data.likesCount,
        };
        setReels(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save / Bookmark Toggle
  const handleSaveToggle = async () => {
    if (!user) {
      alert("Please sign in to save projects.");
      return;
    }
    if (!currentReel) return;

    const prev = currentReel.hasBookmarked;
    const updated = [...reels];
    updated[currentIndex] = {
      ...currentReel,
      hasBookmarked: !prev,
    };
    setReels(updated);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: currentReel.id }),
      });
      if (res.ok) {
        const data = await res.json();
        updated[currentIndex].hasBookmarked = data.bookmarked;
        setReels(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/projects/${currentReel?.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-black text-white">
        <p className="text-sm text-slate-400">Loading DevReels...</p>
      </main>
    );
  }

  if (reels.length === 0) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center bg-[#0b0f19] space-y-4">
        <FolderGit2 className="h-12 w-12 text-slate-600" />
        <h2 className="text-lg font-bold text-white">No Project Demo Videos Yet</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          DevReels features vertical and horizontal coding demonstrations, UI walkthroughs, and app
          previews.
        </p>
        <Link
          href="/projects/new"
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Submit Project with Demo Video
        </Link>
      </main>
    );
  }

  const tags = parseTags(currentReel.techStack);

  return (
    <main className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-black overflow-hidden select-none">
      {/* Top Bar for Back / Feed indicator */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-medium text-white hover:bg-black/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Community Feed</span>
        </Link>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/30 border border-indigo-500/40 backdrop-blur-md text-xs font-semibold text-indigo-300">
          <Sparkles className="h-3 w-3" /> DevReels • Developer Demos Only
        </span>
      </div>

      {/* Navigation Controls (Desktop floating arrows) */}
      <div className="hidden lg:flex flex-col gap-2 absolute right-8 top-1/2 -translate-y-1/2 z-30">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-[#111827]/80 hover:bg-indigo-600 disabled:opacity-30 text-white backdrop-blur-md border border-[#1f293d] transition-colors"
          aria-label="Previous reel"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === reels.length - 1}
          className="p-3 rounded-full bg-[#111827]/80 hover:bg-indigo-600 disabled:opacity-30 text-white backdrop-blur-md border border-[#1f293d] transition-colors"
          aria-label="Next reel"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      {/* Main Reel Card Container (Mobile aspect ratio 9:16) */}
      <div className="relative w-full max-w-[420px] h-[calc(100vh-5rem)] sm:h-[82vh] rounded-none sm:rounded-3xl overflow-hidden bg-zinc-950 border-0 sm:border border-[#1f293d] shadow-2xl flex items-center justify-center">
        {/* Video Element */}
        <video
          ref={videoRef}
          src={currentReel.demoVideoUrl || undefined}
          playsInline
          loop
          muted={isMuted}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Play/Pause Overlay Indicator when paused */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10"
          >
            <div className="h-16 w-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
              <Play className="h-8 w-8 ml-1" />
            </div>
          </div>
        )}

        {/* Audio Mute/Unmute Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Right Floating Action Bar */}
        <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4 text-white">
          {/* Creator Avatar */}
          <Link
            href={`/profile/${currentReel.user.username}`}
            className="relative group flex flex-col items-center"
          >
            <img
              src={
                currentReel.user.avatarUrl ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${currentReel.user.username}`
              }
              alt={currentReel.user.name}
              className="h-10 w-10 rounded-full border-2 border-indigo-500 object-cover"
            />
          </Link>

          {/* YouTube-Style Single Like Button */}
          <button
            onClick={handleLikeToggle}
            className="flex flex-col items-center gap-1 group"
            title={currentReel.hasLiked ? "Unlike" : "Like"}
          >
            <div
              className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-90 ${
                currentReel.hasLiked
                  ? "bg-indigo-600 text-white"
                  : "bg-black/60 hover:bg-black/80 text-white"
              }`}
            >
              <ThumbsUp className={`h-5 w-5 ${currentReel.hasLiked ? "fill-white" : ""}`} />
            </div>
            <span className="text-[11px] font-bold drop-shadow">{currentReel.likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex flex-col items-center gap-1 group"
            title="Comments"
          >
            <div className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-colors">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold drop-shadow">{currentReel.commentsCount}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => setShareModalOpen(true)}
            className="flex flex-col items-center gap-1 group"
            title="Share demo"
          >
            <div className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-colors">
              <Share2 className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium drop-shadow">Share</span>
          </button>

          {/* Save / Bookmark Button */}
          <button
            onClick={handleSaveToggle}
            className="flex flex-col items-center gap-1 group"
            title="Save project"
          >
            <div
              className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
                currentReel.hasBookmarked
                  ? "bg-indigo-600 text-white"
                  : "bg-black/60 hover:bg-black/80 text-white"
              }`}
            >
              <Bookmark className={`h-5 w-5 ${currentReel.hasBookmarked ? "fill-white" : ""}`} />
            </div>
            <span className="text-[10px] font-medium drop-shadow">Save</span>
          </button>
        </div>

        {/* Bottom Overlay: Project Info & Links */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent p-4 sm:p-5 pt-16 text-white space-y-2 pointer-events-auto">
          {/* Creator Attribution */}
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${currentReel.user.username}`}
              className="font-bold text-sm hover:underline flex items-center gap-1"
            >
              {currentReel.user.name}
              {currentReel.user.isVerified && (
                <BadgeCheck className="h-4 w-4 text-indigo-400 fill-indigo-400/20" />
              )}
            </Link>
            <span className="text-xs text-slate-300">@{currentReel.user.username}</span>
          </div>

          {/* Title and Summary */}
          <Link href={`/projects/${currentReel.id}`} className="block group">
            <h2 className="text-base font-bold group-hover:text-indigo-300 transition-colors line-clamp-1">
              {currentReel.title}
            </h2>
            <p className="text-xs text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
              {currentReel.summary}
            </p>
          </Link>

          {/* Tech Stack Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-white"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Direct CTA links */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/projects/${currentReel.id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <span>Full Project Page</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            {currentReel.liveDemoUrl && (
              <a
                href={currentReel.liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-slate-200 hover:text-white underline font-medium"
              >
                <span>Live Demo</span>
              </a>
            )}

            {currentReel.repoUrl && (
              <a
                href={currentReel.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-slate-200 hover:text-white"
              >
                <GithubIcon className="h-3.5 w-3.5" />
                <span>Code</span>
              </a>
            )}
          </div>
        </div>

        {/* Collapsible Slide-up Comments Drawer */}
        {showComments && (
          <div className="absolute inset-x-0 bottom-0 top-1/4 z-30 bg-[#111827] rounded-t-3xl border-t border-[#1f293d] p-4 flex flex-col animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f293d]">
              <h3 className="text-sm font-semibold text-white">Project Comments</h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CommentsDrawer targetId={currentReel.id} targetType="PROJECT" />
            </div>
          </div>
        )}
      </div>

      {/* Share Modal Dialog */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-[#1f293d] bg-[#111827] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Share Project Reel</h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Copy stable link to view &ldquo;{currentReel?.title}&rdquo; showcase on DevPulse.
            </p>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0b0f19] border border-[#1f293d]">
              <input
                type="text"
                readOnly
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/projects/${currentReel?.id}`
                    : ""
                }
                className="w-full bg-transparent text-xs text-slate-300 focus:outline-none"
              />
              <button
                onClick={copyShareLink}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
