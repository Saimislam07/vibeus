"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import type { DeveloperItem, PostItem, ProjectItem } from "@/lib/types";
import {
  Sparkles,
  Clock,
  Users2,
  FolderGit2,
  Flame,
  ArrowRight,
  TrendingUp,
  Tag,
  Loader2,
  Video,
  UserPlus,
  Check,
} from "lucide-react";

async function getFeedPosts(type: string, pageNum: number) {
  const res = await fetch(`/api/posts?feedType=${type}&page=${pageNum}&limit=10`);
  if (!res.ok) throw new Error("Failed to fetch feed posts");
  return (await res.json()) as {
    posts: PostItem[];
    pagination: { page: number; totalPages: number };
  };
}

export default function HomePage() {
  const { user } = useAuth();
  const [feedType, setFeedType] = useState<"recommended" | "latest" | "following">("recommended");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Right sidebar data
  const [trendingProjects, setTrendingProjects] = useState<ProjectItem[]>([]);
  const [suggestedDevelopers, setSuggestedDevelopers] = useState<DeveloperItem[]>([]);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    const loadPosts = async () => {
      try {
        const data = await getFeedPosts(feedType, 1);
        if (!active) return;
        setPosts(data.posts);
        setHasMore(data.pagination.page < data.pagination.totalPages);
      } catch (err) {
        console.error("Error fetching feed posts:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadPosts();
    return () => {
      active = false;
    };
  }, [feedType]);

  const handleFeedTypeChange = (nextFeedType: "recommended" | "latest" | "following") => {
    if (nextFeedType === feedType) return;
    setLoading(true);
    setPage(1);
    setFeedType(nextFeedType);
  };

  // Fetch sidebar widgets (Trending projects and suggested developers)
  useEffect(() => {
    fetch("/api/projects?sort=popular&limit=4")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects) setTrendingProjects(data.projects);
      })
      .catch((err) => console.error(err));

    fetch("/api/explore?type=developers&limit=4")
      .then((res) => res.json())
      .then((data) => {
        if (data.developers) setSuggestedDevelopers(data.developers);
      })
      .catch((err) => console.error(err));
  }, []);

  const handlePostCreated = (newPost: PostItem) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (deletedId: string) => {
    setPosts(posts.filter((p) => p.id !== deletedId));
  };

  const handleConnect = async (developerId: string) => {
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: developerId }),
      });
      if (res.ok) {
        setConnectedIds((prev) => new Set([...prev, developerId]));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    setPage(nextPage);
    try {
      const data = await getFeedPosts(feedType, nextPage);
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching more feed posts:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl flex">
      {/* Desktop Sidebar Navigation */}
      <Sidebar />

      {/* Main Feed Column */}
      <main className="flex-1 min-w-0 border-r border-[#1f293d] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome Hero / DevReels Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-[#111827] to-[#141c2e] border border-indigo-500/20 p-5 sm:p-6 shadow-md">
          <div className="relative z-10 max-w-xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="h-3 w-3" /> Independent Developer Community
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Discover, showcase, and connect
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Publish your software projects, browse technical vertical reels, and engage in peer
              discussions with developers worldwide.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/projects/new"
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                + Submit Project
              </Link>
              <Link
                href="/reels"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141c2e] hover:bg-[#1a253d] text-slate-200 text-xs font-medium border border-[#1f293d] transition-colors"
              >
                <Video className="h-3.5 w-3.5 text-indigo-400" />
                <span>Watch DevReels</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Post Composer for Logged-In Developers */}
        {user ? (
          <PostComposer onPostCreated={handlePostCreated} />
        ) : (
          <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 text-center space-y-2">
            <h3 className="text-sm font-semibold text-white">
              Have a project or technical update?
            </h3>
            <p className="text-xs text-slate-400">
              Sign in to share project announcements, code discussions, and milestones with the
              developer community.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Sign In to Post
              </Link>
            </div>
          </div>
        )}

        {/* Feed Type Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#1f293d] pb-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => handleFeedTypeChange("recommended")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                feedType === "recommended"
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#141c2e]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Recommended</span>
            </button>

            <button
              onClick={() => handleFeedTypeChange("latest")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                feedType === "latest"
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#141c2e]"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Latest</span>
            </button>

            {user && (
              <button
                onClick={() => handleFeedTypeChange("following")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  feedType === "following"
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#141c2e]"
                }`}
              >
                <Users2 className="h-3.5 w-3.5" />
                <span>My Network</span>
              </button>
            )}
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {/* Feed Stream */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
            <p className="text-xs text-slate-400">Loading community stream...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1f293d] p-12 text-center space-y-3">
            <FolderGit2 className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No posts in this feed yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {feedType === "following"
                ? "You haven't connected with developers who have posted yet. Explore developers to expand your network!"
                : "Be the first developer to post an update or announce a new project!"}
            </p>
            {feedType === "following" && (
              <Link
                href="/explore"
                className="inline-block mt-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Find Developers
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
            ))}

            {hasMore && (
              <div className="pt-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-5 py-2 rounded-xl bg-[#141c2e] hover:bg-[#1b253b] border border-[#1f293d] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  {loadingMore ? "Loading more posts..." : "Load More Posts"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Right Sidebar Widgets */}
      <aside className="hidden xl:flex flex-col w-80 shrink-0 p-6 space-y-6">
        {/* Trending Projects Widget */}
        <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-400" />
              Trending Projects
            </h3>
            <Link href="/projects" className="text-xs text-indigo-400 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-2.5">
            {trendingProjects.map((proj) => (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="block p-2 rounded-xl hover:bg-[#141c2e] border border-transparent hover:border-[#1f293d] transition-all group"
              >
                <div className="flex items-start gap-2.5">
                  {proj.thumbnailUrl && (
                    <img
                      src={proj.thumbnailUrl}
                      alt={proj.title}
                      className="h-10 w-14 rounded-md object-cover border border-[#1f293d] shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white group-hover:text-indigo-400 truncate">
                      {proj.title}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{proj.summary}</p>
                    <span className="text-[10px] text-indigo-400 font-medium">
                      {proj.likesCount} {proj.likesCount === 1 ? "like" : "likes"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Suggested Developers Widget */}
        <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Users2 className="h-4 w-4 text-indigo-400" />
              Discover Developers
            </h3>
            <Link href="/explore" className="text-xs text-indigo-400 hover:underline">
              Explore
            </Link>
          </div>

          <div className="space-y-3">
            {suggestedDevelopers
              .filter((d) => d.id !== user?.id)
              .slice(0, 4)
              .map((dev) => (
                <div key={dev.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={`/profile/${dev.username}`}
                    className="flex items-center gap-2.5 min-w-0 group"
                  >
                    <img
                      src={
                        dev.avatarUrl ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${dev.username}`
                      }
                      alt={dev.name}
                      className="h-8 w-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white group-hover:text-indigo-400 truncate">
                        {dev.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">@{dev.username}</p>
                    </div>
                  </Link>

                  {user && (
                    <button
                      onClick={() => handleConnect(dev.id)}
                      disabled={dev.isConnected || dev.isPending || connectedIds.has(dev.id)}
                      className="px-2.5 py-1 rounded-md bg-[#141c2e] hover:bg-indigo-600 text-slate-300 hover:text-white disabled:opacity-50 text-[11px] font-medium transition-colors shrink-0"
                    >
                      {dev.isConnected
                        ? "Connected"
                        : dev.isPending || connectedIds.has(dev.id)
                          ? "Pending"
                          : "+ Connect"}
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Community Guidelines & Footer */}
        <div className="p-4 rounded-2xl bg-[#0b0f19] border border-[#1f293d] space-y-2 text-[11px] text-slate-500">
          <p className="font-semibold text-slate-400">DevPulse Community Standard</p>
          <p>
            An independent space for developers to showcase genuine code, exchange engineering
            insights, and celebrate milestones.
          </p>
          <div className="pt-2 border-t border-[#1f293d] flex flex-wrap gap-x-3 gap-y-1 text-slate-500">
            <Link href="/explore" className="hover:text-slate-300">
              Explore
            </Link>
            <Link href="/projects" className="hover:text-slate-300">
              Showcase
            </Link>
            <Link href="/reels" className="hover:text-slate-300">
              DevReels
            </Link>
            <Link href="/admin" className="hover:text-slate-300">
              Admin
            </Link>
          </div>
          <p className="pt-1 text-[10px] text-slate-600">© 2026 DevPulse. Built for builders.</p>
        </div>
      </aside>
    </div>
  );
}
