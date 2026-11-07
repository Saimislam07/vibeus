"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { timeAgo } from "@/lib/utils";
import SocialActionBar from "./SocialActionBar";
import CommentsDrawer from "./CommentsDrawer";
import {
  MoreHorizontal,
  Trash2,
  Edit3,
  ExternalLink,
  FolderGit2,
  BadgeCheck,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
    postType: string;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
    hasLiked: boolean;
    hasBookmarked: boolean;
    user: {
      id: string;
      name: string;
      username: string;
      avatarUrl?: string | null;
      role: string;
      isVerified: boolean;
      experienceLevel?: string | null;
    };
    project?: {
      id: string;
      title: string;
      summary: string;
      category: string;
      techStack: string;
      thumbnailUrl?: string | null;
      liveDemoUrl?: string | null;
      repoUrl?: string | null;
      status: string;
    } | null;
  };
  onDelete?: (id: string) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [editLoading, setEditLoading] = useState(false);

  const isAuthor = user?.id === post.user.id;
  const isAdmin = user?.role === "ADMIN";

  const handleEditSubmit = async () => {
    if (!content.trim()) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (res.ok && onDelete) {
        onDelete(post.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getBadgeForPostType = (type: string) => {
    switch (type) {
      case "PROJECT_ANNOUNCEMENT":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Project Launch
          </span>
        );
      case "MILESTONE":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Milestone 🏆
          </span>
        );
      case "HELP_WANTED":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">
            Code Review / Help
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <article className="rounded-2xl border border-[#1f293d] bg-[#111827] p-4 sm:p-5 shadow-sm space-y-3.5 transition-all hover:border-[#2d3b55]">
      {/* Header: Author + Post Type + Menu */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.user.username}`} className="shrink-0">
            <img
              src={
                post.user.avatarUrl ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${post.user.username}`
              }
              alt={post.user.name}
              className="h-10 w-10 rounded-full object-cover border border-[#1f293d]"
            />
          </Link>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/profile/${post.user.username}`}
                className="font-bold text-sm text-white hover:text-indigo-400 transition-colors flex items-center gap-1"
              >
                {post.user.name}
                {post.user.isVerified && (
                  <BadgeCheck className="h-4 w-4 text-indigo-400 fill-indigo-400/20" />
                )}
              </Link>
              <span className="text-xs text-slate-400">@{post.user.username}</span>
              {getBadgeForPostType(post.postType)}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{post.user.experienceLevel || "Developer"}</span>
              <span>•</span>
              <Link href={`/posts/${post.id}`} className="hover:underline">
                {timeAgo(post.createdAt)}
              </Link>
            </div>
          </div>
        </div>

        {/* Options Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#141c2e] transition-colors"
            aria-label="Post options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded-xl border border-[#1f293d] bg-[#0b0f19] shadow-xl py-1 z-20 text-xs text-slate-300 animate-fade-in">
              <Link
                href={`/posts/${post.id}`}
                className="flex items-center gap-2 px-3 py-2 hover:bg-[#141c2e]"
                onClick={() => setMenuOpen(false)}
              >
                <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                <span>Open Permalink</span>
              </Link>

              {isAuthor && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#141c2e] text-left"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                  <span>Edit Post</span>
                </button>
              )}

              {(isAuthor || isAdmin) && (
                <button
                  onClick={() => {
                    handleDeletePost();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-red-400 text-left"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content or Edit Area */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSubmit}
              disabled={editLoading}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line break-words">
          {content}
        </p>
      )}

      {/* Optional Attached Media */}
      {post.mediaUrl && (
        <div className="rounded-xl overflow-hidden border border-[#1f293d] bg-black/40">
          {post.mediaType === "video" ? (
            <video src={post.mediaUrl} controls className="w-full max-h-96 object-contain" />
          ) : (
            <img
              src={post.mediaUrl}
              alt="Attached media"
              className="w-full max-h-96 object-cover"
            />
          )}
        </div>
      )}

      {/* Attached Project Card Embed */}
      {post.project && (
        <Link
          href={`/projects/${post.project.id}`}
          className="block rounded-xl border border-indigo-500/20 bg-[#141c2e]/70 p-3.5 hover:bg-[#141c2e] hover:border-indigo-500/40 transition-all group"
        >
          <div className="flex items-start gap-3">
            {post.project.thumbnailUrl && (
              <img
                src={post.project.thumbnailUrl}
                alt={post.project.title}
                className="h-16 w-24 rounded-lg object-cover shrink-0 border border-[#1f293d]"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 truncate">
                  {post.project.title}
                </h4>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1 mt-1">{post.project.summary}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-medium">
                  {post.project.category}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-xs">
                  {post.project.techStack}
                </span>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 shrink-0" />
          </div>
        </Link>
      )}

      {/* Social Action Bar (Like, Comment, Share, Save) */}
      <SocialActionBar
        targetId={post.id}
        targetType="POST"
        likesCount={post.likesCount}
        commentsCount={commentsCount}
        hasLiked={post.hasLiked}
        hasBookmarked={post.hasBookmarked}
        onCommentClick={() => setShowComments(!showComments)}
        shareTitle={`Check out this developer post by ${post.user.name}`}
      />

      {/* Collapsible Comments Section */}
      {showComments && (
        <CommentsDrawer
          targetId={post.id}
          targetType="POST"
          onCommentCountChange={(newCount) => setCommentsCount(newCount)}
        />
      )}
    </article>
  );
}
