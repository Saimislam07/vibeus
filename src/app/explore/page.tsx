"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import type { DeveloperItem, ProjectItem } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";
import { parseTags } from "@/lib/utils";
import {
  Compass,
  Search,
  Users2,
  FolderGit2,
  MapPin,
  Globe,
  BadgeCheck,
  Loader2,
  Check,
  UserPlus,
} from "lucide-react";

function ExploreContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState<"developers" | "projects">("developers");
  const [query, setQuery] = useState(initialQuery);
  const [skillFilter, setSkillFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const [developers, setDevelopers] = useState<DeveloperItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  const techPills = [
    "TypeScript",
    "Python",
    "React",
    "Rust",
    "Go",
    "Next.js",
    "Docker",
    "Three.js",
    "Flutter",
  ];

  const performSearch = async () => {
    setLoading(true);
    try {
      if (activeTab === "developers") {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (skillFilter) params.set("skill", skillFilter);
        if (countryFilter) params.set("country", countryFilter);
        params.set("type", "developers");

        const res = await fetch(`/api/explore?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setDevelopers(data.developers || []);
        }
      } else {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (skillFilter) params.set("tag", skillFilter);

        const res = await fetch(`/api/projects?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 250);
    return () => clearTimeout(timer);
  }, [query, skillFilter, countryFilter, activeTab]);

  const handleConnect = async (devId: string) => {
    if (!user) {
      alert("Sign in to connect with developers.");
      return;
    }
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: devId }),
      });
      if (res.ok) {
        setConnectedIds((prev) => new Set([...prev, devId]));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Compass className="h-6 w-6 text-indigo-400" />
            Explore Developers & Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Find technical collaborators, discover developers by skills or location, and explore
            community software.
          </p>
        </div>

        {/* Tab switchers & Search Bar */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#1f293d] pb-2 text-sm font-semibold">
            <button
              onClick={() => setActiveTab("developers")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "developers"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#111827]"
              }`}
            >
              <Users2 className="h-4 w-4" />
              <span>Developers</span>
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "projects"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#111827]"
              }`}
            >
              <FolderGit2 className="h-4 w-4" />
              <span>Projects</span>
            </button>
          </div>

          {/* Search Inputs */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === "developers"
                    ? "Search developers by name, username, bio..."
                    : "Search projects by title, summary..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#111827] border border-[#1f293d] text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {activeTab === "developers" && (
              <input
                type="text"
                placeholder="Filter by country or city..."
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full sm:w-56 h-10 px-3 rounded-xl bg-[#111827] border border-[#1f293d] text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          {/* Tech Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSkillFilter("")}
              className={`px-3 py-1 rounded-lg font-medium shrink-0 transition-colors ${
                skillFilter === ""
                  ? "bg-indigo-600 text-white"
                  : "bg-[#111827] border border-[#1f293d] text-slate-300 hover:text-white"
              }`}
            >
              All Tech
            </button>
            {techPills.map((tech) => (
              <button
                key={tech}
                onClick={() => setSkillFilter(skillFilter === tech ? "" : tech)}
                className={`px-3 py-1 rounded-lg font-medium shrink-0 transition-colors ${
                  skillFilter === tech
                    ? "bg-indigo-600 text-white"
                    : "bg-[#111827] border border-[#1f293d] text-slate-300 hover:text-white"
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
            <p className="text-xs text-slate-400">Searching community index...</p>
          </div>
        ) : activeTab === "developers" ? (
          developers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1f293d] p-12 text-center text-slate-400 text-sm">
              No developers found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {developers.map((dev) => {
                const skills = parseTags(dev.skills);
                const isConnected = dev.isConnected || connectedIds.has(dev.id);
                const isPending = dev.isPending || connectedIds.has(dev.id);

                return (
                  <div
                    key={dev.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#1f293d] bg-[#111827] p-5 hover:border-indigo-500/40 transition-all space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <Link href={`/profile/${dev.username}`} className="flex items-center gap-3">
                          <img
                            src={
                              dev.avatarUrl ||
                              `https://api.dicebear.com/7.x/identicon/svg?seed=${dev.username}`
                            }
                            alt={dev.name}
                            className="h-12 w-12 rounded-full object-cover border border-[#1f293d]"
                          />
                          <div>
                            <h3 className="text-sm font-bold text-white hover:text-indigo-400 flex items-center gap-1">
                              {dev.name}
                              {dev.isVerified && (
                                <BadgeCheck className="h-4 w-4 text-indigo-400 fill-indigo-400/20" />
                              )}
                            </h3>
                            <p className="text-xs text-slate-400">@{dev.username}</p>
                          </div>
                        </Link>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {dev.bio || "Developer on DevPulse"}
                      </p>

                      {(dev.district || dev.country) && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{[dev.district, dev.country].filter(Boolean).join(", ")}</span>
                        </div>
                      )}

                      {/* Skills Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {skills.slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded bg-[#0b0f19] text-indigo-300 border border-[#1f293d]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#1f293d]">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{dev._count?.projects || 0} projects</span>
                        <span>•</span>
                        <span>{dev._count?.posts || 0} posts</span>
                      </div>

                      {dev.isSelf ? (
                        <span className="text-xs text-slate-500 font-medium">You</span>
                      ) : (
                        <button
                          onClick={() => handleConnect(dev.id)}
                          disabled={isConnected || isPending}
                          className="px-3 py-1.5 rounded-lg bg-[#141c2e] hover:bg-indigo-600 disabled:opacity-50 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
                        >
                          {dev.isConnected ? "Connected" : isPending ? "Requested" : "+ Connect"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1f293d] p-12 text-center text-slate-400 text-sm">
            No projects found matching query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={<div className="p-12 text-center text-slate-400">Loading explore index...</div>}
    >
      <ExploreContent />
    </Suspense>
  );
}
