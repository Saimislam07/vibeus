"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ProjectCard from "@/components/ProjectCard";
import type { CategoryItem, ProjectItem } from "@/lib/types";
import {
  FolderGit2,
  Search,
  PlusCircle,
  Filter,
  Sparkles,
  TrendingUp,
  Clock,
  Eye,
  Loader2,
  Layers,
} from "lucide-react";

export default function ProjectsShowcasePage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("popular");
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (category !== "All") params.set("category", category);
      params.set("sort", sort);

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, sort]);

  return (
    <div className="mx-auto max-w-7xl flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <FolderGit2 className="h-6 w-6 text-indigo-400" />
              Project Showcase
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore open-source apps, developer tools, and full-stack creations built by the
              community.
            </p>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit Your Project</span>
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects by title, summary, or tech stack..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#111827] border border-[#1f293d] text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Sorting Tabs */}
            <div className="flex items-center gap-1 bg-[#111827] border border-[#1f293d] p-1 rounded-xl shrink-0 text-xs">
              <button
                onClick={() => setSort("popular")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  sort === "popular"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Popular</span>
              </button>
              <button
                onClick={() => setSort("latest")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  sort === "latest" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Latest</span>
              </button>
              <button
                onClick={() => setSort("views")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  sort === "views" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Most Viewed</span>
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setCategory("All")}
              className={`px-3 py-1.5 rounded-lg font-medium shrink-0 transition-colors ${
                category === "All"
                  ? "bg-indigo-600 text-white"
                  : "bg-[#111827] border border-[#1f293d] text-slate-300 hover:text-white"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.name)}
                className={`px-3 py-1.5 rounded-lg font-medium shrink-0 transition-colors ${
                  category === cat.name
                    ? "bg-indigo-600 text-white"
                    : "bg-[#111827] border border-[#1f293d] text-slate-300 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
            <p className="text-xs text-slate-400">Loading showcase projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1f293d] p-12 text-center space-y-3">
            <Layers className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No projects found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn&apos;t find any projects matching your criteria. Try adjusting your search
              query or category filter.
            </p>
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
