"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/PostCard";
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import type { PostItem } from "@/lib/types";

export default function SinglePostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [post, setPost] = useState<PostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then((data) => setPost(data.post))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-7xl flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Community Feed</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
            <p className="text-xs text-slate-400">Loading post permalink...</p>
          </div>
        ) : error || !post ? (
          <div className="rounded-2xl border border-dashed border-[#1f293d] p-12 text-center space-y-3">
            <MessageSquare className="h-10 w-10 text-slate-600 mx-auto" />
            <h2 className="text-base font-bold text-white">Post Not Found</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              This post may have been deleted by its author or removed by moderators.
            </p>
            <Link
              href="/"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Return to Feed
            </Link>
          </div>
        ) : (
          <div className="max-w-3xl">
            <PostCard post={post} onDelete={() => router.push("/")} />
          </div>
        )}
      </main>
    </div>
  );
}
