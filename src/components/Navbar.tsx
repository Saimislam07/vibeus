"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Code2,
  Search,
  Bell,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  User,
  Settings,
  Bookmark,
  LogOut,
  Menu,
  X,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { NotificationItem } from "@/lib/types";

export default function Navbar() {
  const { user, loading, unreadNotifications, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleNotif = () => {
    if (!notifOpen) {
      fetchNotifications();
    }
    setNotifOpen(!notifOpen);
    setProfileOpen(false);
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1f293d] bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
              <Code2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                DevPulse
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/40">
                  Dev
                </span>
              </span>
            </div>
          </Link>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex relative items-center w-72 lg:w-96"
          >
            <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects, developers, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-[#141c2e] border border-[#1f293d] text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </form>
        </div>

        {/* Center / Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname === "/"
                ? "text-indigo-400 bg-[#141c2e]"
                : "text-slate-300 hover:text-white hover:bg-[#141c2e]/60"
            }`}
          >
            Feed
          </Link>
          <Link
            href="/explore"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith("/explore")
                ? "text-indigo-400 bg-[#141c2e]"
                : "text-slate-300 hover:text-white hover:bg-[#141c2e]/60"
            }`}
          >
            Explore
          </Link>
          <Link
            href="/projects"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith("/projects") && pathname !== "/projects/new"
                ? "text-indigo-400 bg-[#141c2e]"
                : "text-slate-300 hover:text-white hover:bg-[#141c2e]/60"
            }`}
          >
            Showcase
          </Link>
          <Link
            href="/reels"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname.startsWith("/reels")
                ? "text-indigo-400 bg-[#141c2e]"
                : "text-slate-300 hover:text-white hover:bg-[#141c2e]/60"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            DevReels
          </Link>
          <Link
            href="/connections"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith("/connections")
                ? "text-indigo-400 bg-[#141c2e]"
                : "text-slate-300 hover:text-white hover:bg-[#141c2e]/60"
            }`}
          >
            Network
          </Link>
        </nav>

        {/* Right Navigation / User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* Submit Project CTA */}
              <Link
                href="/projects/new"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-sm transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Submit Project</span>
              </Link>

              {/* Messages */}
              <Link
                href="/messages"
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#141c2e] transition-colors"
                title="Private Messages"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotif}
                  className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#141c2e] transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#1f293d] bg-[#111827] shadow-xl p-3 z-50 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-[#1f293d] pb-2 mb-2">
                      <span className="font-semibold text-sm text-slate-200">Notifications</span>
                      <button
                        onClick={markAllRead}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-1">
                      {notifications.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 py-6">
                          No notifications yet
                        </p>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <Link
                            key={n.id}
                            href={n.link || "/notifications"}
                            onClick={() => setNotifOpen(false)}
                            className={`block p-2.5 rounded-lg text-xs transition-colors ${
                              n.isRead
                                ? "text-slate-400 hover:bg-[#141c2e]"
                                : "bg-[#18233a] text-slate-200 font-medium hover:bg-[#1c2a47]"
                            }`}
                          >
                            <p className="font-semibold text-white">{n.title}</p>
                            <p className="line-clamp-2 mt-0.5 text-slate-300">{n.message}</p>
                          </Link>
                        ))
                      )}
                    </div>

                    <div className="border-t border-[#1f293d] pt-2 mt-2 text-center">
                      <Link
                        href="/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-lg p-1 hover:bg-[#141c2e] transition-colors focus:outline-none"
                >
                  <img
                    src={
                      user.avatarUrl ||
                      `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`
                    }
                    alt={user.name}
                    className="h-8 w-8 rounded-full border border-indigo-500/40 object-cover"
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#1f293d] bg-[#111827] shadow-xl py-1 z-50 animate-fade-in text-sm text-slate-200">
                    <div className="px-4 py-2.5 border-b border-[#1f293d]">
                      <p className="font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                      {user.role === "ADMIN" && (
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                          Super Admin
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        href={`/profile/${user.username}`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#141c2e] transition-colors"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#141c2e] transition-colors"
                      >
                        <Layers className="h-4 w-4 text-slate-400" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href="/dashboard?tab=saved"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#141c2e] transition-colors"
                      >
                        <Bookmark className="h-4 w-4 text-slate-400" />
                        <span>Saved Projects & Posts</span>
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#141c2e] transition-colors"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        <span>Settings</span>
                      </Link>

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-amber-400 hover:bg-[#141c2e] transition-colors font-medium"
                        >
                          <ShieldCheck className="h-4 w-4 text-amber-400" />
                          <span>Admin Portal</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-[#1f293d] pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-[#141c2e] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
              >
                Join Community
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#141c2e]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1f293d] bg-[#0b0f19] px-4 py-4 space-y-3 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search DevPulse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-[#141c2e] border border-[#1f293d] text-sm text-slate-200"
            />
          </form>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-[#141c2e] text-slate-200 hover:text-indigo-400"
            >
              Feed
            </Link>
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-[#141c2e] text-slate-200 hover:text-indigo-400"
            >
              Explore
            </Link>
            <Link
              href="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-[#141c2e] text-slate-200 hover:text-indigo-400"
            >
              Showcase
            </Link>
            <Link
              href="/reels"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-[#141c2e] text-indigo-400 font-medium"
            >
              DevReels (Videos)
            </Link>
            <Link
              href="/connections"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-[#141c2e] text-slate-200 hover:text-indigo-400"
            >
              Network
            </Link>
            {user && (
              <Link
                href="/projects/new"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-indigo-600 text-white font-medium text-center col-span-2"
              >
                + Submit Project
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
