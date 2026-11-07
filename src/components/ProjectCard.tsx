"use client";

import React from "react";
import Link from "next/link";
import { parseTags } from "@/lib/utils";
import SocialActionBar from "./SocialActionBar";
import { FolderGit2, ExternalLink, Eye, Video, BadgeCheck } from "lucide-react";
import { GithubIcon } from "./Icons";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    summary: string;
    category: string;
    techStack: string;
    thumbnailUrl?: string | null;
    demoVideoUrl?: string | null;
    isVerticalVideo?: boolean;
    liveDemoUrl?: string | null;
    repoUrl?: string | null;
    status: string;
    viewsCount: number;
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
    };
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const tags = parseTags(project.techStack);

  return (
    <div className="flex flex-col rounded-2xl border border-[#1f293d] bg-[#111827] overflow-hidden shadow-sm hover:border-indigo-500/40 hover:shadow-indigo-500/5 transition-all group">
      {/* Thumbnail or Placeholder */}
      <Link
        href={`/projects/${project.id}`}
        className="relative aspect-[16/9] w-full overflow-hidden bg-[#0b0f19]"
      >
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#141c2e] to-[#0b0f19]">
            <FolderGit2 className="h-12 w-12 text-slate-700" />
          </div>
        )}

        {/* Badges on Thumbnail */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#0b0f19]/85 backdrop-blur-md text-white border border-white/10 shadow-sm">
            {project.category}
          </span>
          {project.demoVideoUrl && (
            <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-indigo-600/90 text-white flex items-center gap-1 shadow-sm">
              <Video className="h-3 w-3" /> Demo
            </span>
          )}
        </div>

        {/* Status Pill */}
        <div className="absolute top-3 right-3">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md ${
              project.status === "COMPLETED"
                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-950/80 text-amber-400 border border-amber-500/30"
            }`}
          >
            {project.status === "COMPLETED" ? "Live" : "In Progress"}
          </span>
        </div>
      </Link>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Creator Attribution */}
          <div className="flex items-center justify-between mb-2">
            <Link
              href={`/profile/${project.user.username}`}
              className="flex items-center gap-2 group/author"
            >
              <img
                src={
                  project.user.avatarUrl ||
                  `https://api.dicebear.com/7.x/identicon/svg?seed=${project.user.username}`
                }
                alt={project.user.name}
                className="h-6 w-6 rounded-full object-cover border border-[#1f293d]"
              />
              <span className="text-xs font-medium text-slate-300 group-hover/author:text-indigo-400 transition-colors flex items-center gap-1">
                {project.user.name}
                {project.user.isVerified && (
                  <BadgeCheck className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400/20" />
                )}
              </span>
            </Link>

            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {project.viewsCount}
            </span>
          </div>

          {/* Project Title & Summary */}
          <Link href={`/projects/${project.id}`}>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
              {project.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {project.summary}
            </p>
          </Link>

          {/* Tech Stack Pills */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#141c2e] text-slate-300 border border-[#1f293d]"
              >
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="text-[10px] text-slate-500">+{tags.length - 4} more</span>
            )}
          </div>
        </div>

        {/* External Links Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1f293d]">
          <div className="flex items-center gap-2">
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <span>Live Demo</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
              >
                <GithubIcon className="h-3.5 w-3.5" />
                <span>Code</span>
              </a>
            )}
          </div>

          <Link
            href={`/projects/${project.id}`}
            className="text-xs font-semibold text-slate-300 hover:text-white"
          >
            Details →
          </Link>
        </div>

        {/* Social Action Bar (Like, Comment, Share) */}
        <SocialActionBar
          targetId={project.id}
          targetType="PROJECT"
          likesCount={project.likesCount}
          commentsCount={project.commentsCount}
          hasLiked={project.hasLiked}
          hasBookmarked={project.hasBookmarked}
          shareTitle={`Check out ${project.title} on DevPulse`}
        />
      </div>
    </div>
  );
}
