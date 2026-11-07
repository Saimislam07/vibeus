"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { timeAgo } from "@/lib/utils";
import { Send, MoreVertical, Trash2, Edit2, Check, X, ShieldCheck } from "lucide-react";
import type { CommentItem } from "@/lib/types";

interface CommentsDrawerProps {
  targetId: string;
  targetType: "POST" | "PROJECT";
  onCommentCountChange?: (newCount: number) => void;
}

export default function CommentsDrawer({
  targetId,
  targetType,
  onCommentCountChange,
}: CommentsDrawerProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    let active = true;
    const loadComments = async () => {
      try {
        const endpoint =
          targetType === "POST"
            ? `/api/posts/${targetId}/comments`
            : `/api/projects/${targetId}/comments`;
        const res = await fetch(endpoint);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setComments(data.comments || []);
        onCommentCountChange?.((data.comments || []).length);
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadComments();
    return () => {
      active = false;
    };
  }, [targetId, targetType, onCommentCountChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || submitting || !user) return;

    setSubmitting(true);
    try {
      const endpoint =
        targetType === "POST"
          ? `/api/posts/${targetId}/comments`
          : `/api/projects/${targetId}/comments`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = [...comments, data.comment];
        setComments(updated);
        setNewContent("");
        if (onCommentCountChange) onCommentCountChange(updated.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        const updated = comments.filter((c) => c.id !== commentId);
        setComments(updated);
        if (onCommentCountChange) onCommentCountChange(updated.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments(comments.map((c) => (c.id === commentId ? data.comment : c)));
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-3 border-t border-[#1f293d] space-y-3 animate-fade-in">
      {/* Comment Composer */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <img
            src={
              user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`
            }
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover shrink-0"
          />
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Add your developer insight or feedback..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full h-9 pl-3 pr-10 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!newContent.trim() || submitting}
              className="absolute right-1.5 top-1.5 p-1 rounded-md text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition-colors"
              aria-label="Send comment"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-2.5 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-center text-xs text-slate-400">
          <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign in
          </Link>{" "}
          to join the technical discussion.
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-4 text-center text-xs text-slate-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="py-3 text-center text-xs text-slate-500">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-2.5 group/comment text-xs sm:text-sm"
            >
              <Link href={`/profile/${comment.user.username}`} className="shrink-0">
                <img
                  src={
                    comment.user.avatarUrl ||
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${comment.user.username}`
                  }
                  alt={comment.user.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
              </Link>

              <div className="flex-1 rounded-xl bg-[#0b0f19] border border-[#1f293d]/80 p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      href={`/profile/${comment.user.username}`}
                      className="font-semibold text-white hover:text-indigo-400 transition-colors"
                    >
                      {comment.user.name}
                    </Link>
                    {comment.user.role === "ADMIN" && (
                      <span className="text-[9px] uppercase font-bold px-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Admin
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500">{timeAgo(comment.createdAt)}</span>
                  </div>

                  {/* Actions for author or admin */}
                  {(user?.id === comment.user.id || user?.role === "ADMIN") && (
                    <div className="flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                      {user?.id === comment.user.id && (
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 text-slate-400 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content or Edit Form */}
                {editingId === comment.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 rounded bg-[#111827] border border-[#1f293d] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      rows={2}
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 rounded text-[11px] text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(comment.id)}
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-slate-300 whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
