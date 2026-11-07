"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Compass,
  FolderGit2,
  Video,
  Users2,
  MessageSquare,
  Bookmark,
  UserCircle,
  ShieldCheck,
  Plus,
  Sparkles,
  Layers,
  Terminal,
} from "lucide-react";

export default function Sidebar() {
  const { user, pendingConnections } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { label: "Community Feed", href: "/", icon: Home },
    { label: "Explore Developers", href: "/explore", icon: Compass },
    { label: "Project Showcase", href: "/projects", icon: FolderGit2 },
    { label: "DevReels (Videos)", href: "/reels", icon: Video, badge: "Hot" },
    { label: "Network", href: "/connections", icon: Users2, count: pendingConnections },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Saved Items", href: "/dashboard?tab=saved", icon: Bookmark },
    { label: "Personal Dashboard", href: "/dashboard", icon: Layers },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[#1f293d] min-h-[calc(100vh-4rem)] p-4 space-y-6 bg-[#0b0f19]">
      {/* Primary Navigation Links */}
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Discover & Connect
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("?")[0]);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-300 hover:text-white hover:bg-[#141c2e]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
              {item.count && item.count > 0 ? (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {item.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {/* Super Admin Section (Only for Admin Role) */}
      {user?.role === "ADMIN" && (
        <div className="pt-2 border-t border-[#1f293d] space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-amber-500/80 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Administration
          </p>
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              pathname.startsWith("/admin")
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-[#141c2e]"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Super Admin Portal</span>
          </Link>
        </div>
      )}

      {/* User Quick Identity / Actions */}
      {user ? (
        <div className="pt-2 border-t border-[#1f293d] mt-auto space-y-3">
          <Link
            href="/projects/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Publish Project</span>
          </Link>

          <Link
            href={`/profile/${user.username}`}
            className="flex items-center gap-3 p-2 rounded-lg bg-[#111827] border border-[#1f293d] hover:border-indigo-500/40 transition-colors"
          >
            <img
              src={
                user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`
              }
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover border border-slate-700"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
            </div>
          </Link>
        </div>
      ) : (
        <div className="pt-4 border-t border-[#1f293d] mt-auto">
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#141c2e] to-[#0f172a] border border-[#1f293d] text-center space-y-2">
            <Sparkles className="h-6 w-6 text-indigo-400 mx-auto" />
            <h4 className="text-xs font-semibold text-white">Join the Community</h4>
            <p className="text-[11px] text-slate-400">
              Create an account to showcase code, get peer feedback, and connect with developers.
            </p>
            <Link
              href="/register"
              className="block w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
