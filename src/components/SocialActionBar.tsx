"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ThumbsUp, MessageSquare, Share2, Bookmark, Flag, Check, Copy } from "lucide-react";
import Link from "next/link";

interface SocialActionBarProps {
  targetId: string;
  targetType: "POST" | "PROJECT";
  likesCount: number;
  commentsCount: number;
  hasLiked: boolean;
  hasBookmarked?: boolean;
  onCommentClick?: () => void;
  shareTitle?: string;
  shareUrl?: string;
}

export default function SocialActionBar({
  targetId,
  targetType,
  likesCount: initialLikesCount,
  commentsCount,
  hasLiked: initialHasLiked,
  hasBookmarked: initialHasBookmarked = false,
  onCommentClick,
  shareTitle = "Check this out on DevPulse!",
  shareUrl,
}: SocialActionBarProps) {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [hasBookmarked, setHasBookmarked] = useState(initialHasBookmarked);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportStatus, setReportStatus] = useState<"IDLE" | "SENDING" | "DONE">("IDLE");

  const finalShareUrl =
    shareUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/${targetType === "POST" ? "posts" : "projects"}/${targetId}`
      : "");

  // YouTube-Style Single Like Toggle
  const handleLikeToggle = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    // Optimistic UI update
    const previousLiked = hasLiked;
    const previousCount = likesCount;
    setHasLiked(!previousLiked);
    setLikesCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      const endpoint =
        targetType === "POST" ? `/api/posts/${targetId}/like` : `/api/projects/${targetId}/like`;

      const res = await fetch(endpoint, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setHasLiked(data.liked);
        setLikesCount(data.likesCount);
      } else {
        // Rollback on server error
        setHasLiked(previousLiked);
        setLikesCount(previousCount);
      }
    } catch (err) {
      console.error("Like error:", err);
      setHasLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  };

  // Bookmark / Save Toggle
  const handleSaveToggle = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (isSaving) return;
    setIsSaving(true);
    const prev = hasBookmarked;
    setHasBookmarked(!prev);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          targetType === "POST" ? { postId: targetId } : { projectId: targetId },
        ),
      });
      if (res.ok) {
        const data = await res.json();
        setHasBookmarked(data.bookmarked);
      } else {
        setHasBookmarked(prev);
      }
    } catch (err) {
      console.error(err);
      setHasBookmarked(prev);
    } finally {
      setIsSaving(false);
    }
  };

  // Share functionality (Web Share API + Copy fallback)
  const handleShareClick = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Discover developer projects on DevPulse`,
          url: finalShareUrl,
        });
        return;
      } catch (err) {
        // Fallback to modal if user canceled or browser refused
      }
    }
    setShareModalOpen(true);
  };

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(finalShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const submitReport = async () => {
    if (!reportReason.trim()) return;
    setReportStatus("SENDING");
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason: reportReason.trim(),
        }),
      });
      setReportStatus("DONE");
      setTimeout(() => {
        setReportModalOpen(false);
        setReportStatus("IDLE");
        setReportReason("");
      }, 1500);
    } catch (err) {
      console.error(err);
      setReportStatus("IDLE");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between border-t border-[#1f293d] pt-3 text-xs sm:text-sm text-slate-400">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* YouTube-Style Single Like Button */}
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              hasLiked
                ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                : "hover:bg-[#141c2e] hover:text-slate-200"
            }`}
            title={hasLiked ? "Unlike" : "Like"}
            aria-label="Like post"
          >
            <ThumbsUp
              className={`h-4 w-4 transition-transform ${hasLiked ? "fill-indigo-400 text-indigo-400 scale-110" : ""}`}
            />
            <span className="font-semibold">{likesCount}</span>
            <span className="hidden sm:inline">{likesCount === 1 ? "Like" : "Likes"}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={onCommentClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium hover:bg-[#141c2e] hover:text-slate-200 transition-colors"
            title="Comments"
            aria-label="View comments"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="font-semibold">{commentsCount}</span>
            <span className="hidden sm:inline">Comments</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShareClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium hover:bg-[#141c2e] hover:text-slate-200 transition-colors"
            title="Share"
            aria-label="Share post or project"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Right side actions: Save and Report */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleSaveToggle}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              hasBookmarked
                ? "text-indigo-400 bg-indigo-600/10"
                : "hover:bg-[#141c2e] hover:text-slate-200"
            }`}
            title={hasBookmarked ? "Saved to bookmarks" : "Save for later"}
            aria-label="Bookmark"
          >
            <Bookmark
              className={`h-4 w-4 ${hasBookmarked ? "fill-indigo-400 text-indigo-400" : ""}`}
            />
            <span className="hidden md:inline">{hasBookmarked ? "Saved" : "Save"}</span>
          </button>

          <button
            onClick={() => {
              if (!user) setShowLoginPrompt(true);
              else setReportModalOpen(true);
            }}
            className="p-1.5 rounded-lg hover:bg-[#141c2e] hover:text-red-400 transition-colors"
            title="Report inappropriate content"
            aria-label="Report"
          >
            <Flag className="h-4 w-4 text-slate-500 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#1f293d] bg-[#111827] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Share with Developers</h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Anyone with this stable permalink can view this {targetType.toLowerCase()} on
              DevPulse.
            </p>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0b0f19] border border-[#1f293d]">
              <input
                type="text"
                readOnly
                value={finalShareUrl}
                className="w-full bg-transparent text-xs text-slate-300 focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal for Visitors */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-[#1f293d] bg-[#111827] p-6 shadow-2xl text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
              <ThumbsUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Join the Community</h3>
              <p className="text-xs text-slate-400 mt-1">
                Sign in or create your developer profile to like posts, comment, and connect with
                peers.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                className="block w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="block w-full py-2.5 rounded-lg bg-[#141c2e] hover:bg-[#1a243a] text-slate-200 text-sm font-medium border border-[#1f293d] transition-colors"
              >
                Create Account
              </Link>
            </div>

            <button
              onClick={() => setShowLoginPrompt(false)}
              className="text-xs text-slate-500 hover:text-slate-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content Moderation Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#1f293d] bg-[#111827] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Flag className="h-4 w-4 text-red-400" />
              Report Inappropriate Content
            </h3>
            <p className="text-xs text-slate-400">
              Help us keep DevPulse safe, welcoming, and technical. Describe why this content
              violates community guidelines:
            </p>

            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="e.g. Spam, malicious link, abusive behavior, stolen code..."
              rows={3}
              className="w-full p-3 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-[#141c2e]"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={!reportReason.trim() || reportStatus !== "IDLE"}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold"
              >
                {reportStatus === "SENDING"
                  ? "Submitting..."
                  : reportStatus === "DONE"
                    ? "Reported ✓"
                    : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
