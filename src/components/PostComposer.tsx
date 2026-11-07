"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Image as ImageIcon,
  FolderGit2,
  Sparkles,
  Send,
  X,
  Loader2,
  Trophy,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import type { PostItem, ProjectItem } from "@/lib/types";

interface PostComposerProps {
  onPostCreated: (newPost: PostItem) => void;
}

export default function PostComposer({ onPostCreated }: PostComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("GENERAL");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Attached project
  const [userProjects, setUserProjects] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetch(`/api/projects?userId=${user.id}&limit=20`)
        .then((res) => res.json())
        .then((data) => {
          if (data.projects) setUserProjects(data.projects);
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  if (!user) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setMediaUrl(data.url);
        setMediaType(data.type);
      } else {
        const err = await res.json();
        alert(err.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          mediaUrl,
          mediaType,
          postType,
          projectId: selectedProjectId || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onPostCreated(data.post);
        setContent("");
        setMediaUrl(null);
        setMediaType(null);
        setSelectedProjectId("");
        setShowProjectSelector(false);
        setPostType("GENERAL");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit post");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-4 sm:p-5 shadow-sm space-y-4">
      {/* Post Type Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setPostType("GENERAL")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
            postType === "GENERAL"
              ? "bg-indigo-600 text-white"
              : "bg-[#141c2e] text-slate-300 hover:text-white"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          General Discussion
        </button>

        <button
          type="button"
          onClick={() => {
            setPostType("PROJECT_ANNOUNCEMENT");
            setShowProjectSelector(true);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
            postType === "PROJECT_ANNOUNCEMENT"
              ? "bg-emerald-600 text-white"
              : "bg-[#141c2e] text-slate-300 hover:text-white"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Project Launch
        </button>

        <button
          type="button"
          onClick={() => setPostType("MILESTONE")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
            postType === "MILESTONE"
              ? "bg-amber-600 text-white"
              : "bg-[#141c2e] text-slate-300 hover:text-white"
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          Milestone
        </button>

        <button
          type="button"
          onClick={() => setPostType("HELP_WANTED")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
            postType === "HELP_WANTED"
              ? "bg-sky-600 text-white"
              : "bg-[#141c2e] text-slate-300 hover:text-white"
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Ask Community
        </button>
      </div>

      {/* Main Composer Area */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-start gap-3">
          <img
            src={
              user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`
            }
            alt={user.name}
            className="h-10 w-10 rounded-full object-cover shrink-0 border border-[#1f293d]"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postType === "PROJECT_ANNOUNCEMENT"
                  ? "Announce what you built, architecture choices, lessons learned..."
                  : postType === "MILESTONE"
                    ? "Share your learning or engineering milestone with the community..."
                    : "What are you engineering today? Share updates, technical questions, or experiments..."
              }
              rows={3}
              className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Selected Project Attachment Badge */}
        {selectedProjectId && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
            <div className="flex items-center gap-2 text-indigo-300">
              <FolderGit2 className="h-4 w-4" />
              <span>
                Attached project:{" "}
                <strong>{userProjects.find((p) => p.id === selectedProjectId)?.title}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedProjectId("")}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Project Selector dropdown if toggled */}
        {showProjectSelector && !selectedProjectId && userProjects.length > 0 && (
          <div className="p-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] space-y-2">
            <p className="text-xs font-semibold text-slate-300">
              Select one of your projects to link:
            </p>
            <div className="flex flex-wrap gap-2">
              {userProjects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setShowProjectSelector(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#141c2e] hover:bg-indigo-600/30 text-xs text-slate-300 border border-[#1f293d] transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Media Preview */}
        {mediaUrl && (
          <div className="relative rounded-xl overflow-hidden border border-[#1f293d] max-h-60 bg-black/50">
            {mediaType === "video" ? (
              <video src={mediaUrl} controls className="w-full max-h-60 object-contain" />
            ) : (
              <img src={mediaUrl} alt="Upload preview" className="w-full max-h-60 object-cover" />
            )}
            <button
              type="button"
              onClick={() => {
                setMediaUrl(null);
                setMediaType(null);
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Bottom Bar: Action buttons and Post Submit */}
        <div className="flex items-center justify-between border-t border-[#1f293d] pt-3">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/mp4,video/webm"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-[#141c2e] transition-colors"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              ) : (
                <ImageIcon className="h-4 w-4 text-indigo-400" />
              )}
              <span>{uploading ? "Uploading..." : "Add Media"}</span>
            </button>

            {userProjects.length > 0 && !selectedProjectId && (
              <button
                type="button"
                onClick={() => setShowProjectSelector(!showProjectSelector)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-[#141c2e] transition-colors"
              >
                <FolderGit2 className="h-4 w-4 text-emerald-400" />
                <span>Link Project</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{content.length}/3000</span>
            <button
              type="submit"
              disabled={!content.trim() || submitting || uploading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Publish</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
