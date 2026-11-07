"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { timeAgo } from "@/lib/utils";
import type {
  AdminReportItem,
  AdminStats,
  AdminUserItem,
  AnnouncementItem,
  AuditLogItem,
  CategoryItem,
  TechTagItem,
} from "@/lib/types";
import {
  ShieldCheck,
  Users,
  FolderGit2,
  MessageSquare,
  Video,
  AlertTriangle,
  FileText,
  Activity,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Trash2,
  Plus,
  Loader2,
  Layers,
  Megaphone,
  Tag,
  ShieldAlert,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "reports" | "announcements" | "categories" | "logs"
  >("overview");

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users Tab
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Reports Tab
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Announcements Tab
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [newAnnType, setNewAnnType] = useState("INFO");

  // Categories & Tags Tab
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [techTags, setTechTags] = useState<TechTagItem[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Feedback banner
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load Overview Stats
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.metrics);
        setAuditLogs(data.recentAuditLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;

    let active = true;
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setStats(data.metrics);
        setAuditLogs(data.recentAuditLogs || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingStats(false);
      }
    };

    void fetchStats();
    return () => {
      active = false;
    };
  }, [user]);

  // Load Users
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (userSearch.trim()) params.set("q", userSearch.trim());
      if (userRoleFilter !== "ALL") params.set("role", userRoleFilter);
      if (userStatusFilter !== "ALL") params.set("status", userStatusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load Reports
  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Load Announcements & Categories
  const loadConfig = async () => {
    try {
      const [annRes, catRes] = await Promise.all([
        fetch("/api/admin/announcements"),
        fetch("/api/admin/categories"),
      ]);
      if (annRes.ok) {
        const d = await annRes.json();
        setAnnouncements(d.announcements || []);
      }
      if (catRes.ok) {
        const d = await catRes.json();
        setCategories(d.categories || []);
        setTechTags(d.techTags || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchTabData = async () => {
      try {
        if (activeTab === "users") {
          const params = new URLSearchParams();
          if (userSearch.trim()) params.set("q", userSearch.trim());
          if (userRoleFilter !== "ALL") params.set("role", userRoleFilter);
          if (userStatusFilter !== "ALL") params.set("status", userStatusFilter);
          const res = await fetch(`/api/admin/users?${params.toString()}`);
          if (res.ok) {
            const data = await res.json();
            if (active) setUsers(data.users || []);
          }
        } else if (activeTab === "reports") {
          const res = await fetch("/api/admin/reports");
          if (res.ok) {
            const data = await res.json();
            if (active) setReports(data.reports || []);
          }
        } else if (activeTab === "announcements" || activeTab === "categories") {
          const [annRes, catRes] = await Promise.all([
            fetch("/api/admin/announcements"),
            fetch("/api/admin/categories"),
          ]);
          if (annRes.ok) {
            const data = await annRes.json();
            if (active) setAnnouncements(data.announcements || []);
          }
          if (catRes.ok) {
            const data = await catRes.json();
            if (active) {
              setCategories(data.categories || []);
              setTechTags(data.techTags || []);
            }
          }
        } else if (activeTab === "logs") {
          const res = await fetch("/api/admin/audit-logs");
          if (res.ok) {
            const data = await res.json();
            if (active) setAuditLogs(data.auditLogs || []);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    void fetchTabData();
    return () => {
      active = false;
    };
  }, [activeTab, userSearch, userRoleFilter, userStatusFilter]);

  if (authLoading) return null;

  // Access restriction: Strictly Super Admin
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1 p-16 text-center space-y-4">
          <ShieldAlert className="h-14 w-14 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            The Super Admin Portal is restricted to authorized platform administrators. Log in with
            an administrator account to continue.
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
          >
            Switch to Admin Login
          </Link>
        </main>
      </div>
    );
  }

  // User Actions
  const handleUserAction = async (userId: string, action: string, newRole?: string) => {
    let reason = "";
    if (action === "SUSPEND" || action === "BAN") {
      const promptRes = prompt(`Please enter administrative reason for ${action.toLowerCase()}:`);
      if (!promptRes) return;
      reason = promptRes;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, reason, newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionNotice(data.message);
        loadUsers();
        loadStats();
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Report Resolution
  const handleReportAction = async (reportId: string, status: "RESOLVED" | "DISMISSED") => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status }),
      });
      if (res.ok) {
        loadReports();
        loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Content deletion by Admin
  const handleDeleteContent = async (targetType: string, targetId: string) => {
    if (!confirm(`Are you sure you want to permanently delete this ${targetType.toLowerCase()}?`))
      return;
    try {
      const res = await fetch("/api/admin/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason: "Moderator content removal" }),
      });
      if (res.ok) {
        setActionNotice(`${targetType} deleted by Admin.`);
        loadReports();
        loadStats();
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Announcement Actions
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newAnnTitle, content: newAnnContent, type: newAnnType }),
      });
      if (res.ok) {
        setNewAnnTitle("");
        setNewAnnContent("");
        loadConfig();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAnnouncement = async (id: string, current: boolean) => {
    try {
      await fetch("/api/admin/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      loadConfig();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete announcement?")) return;
    try {
      await fetch("/api/admin/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      loadConfig();
    } catch (err) {
      console.error(err);
    }
  };

  // Category & Tag Creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "CATEGORY", name: newCatName.trim() }),
      });
      if (res.ok) {
        setNewCatName("");
        loadConfig();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "TECH_TAG", name: newTagName.trim() }),
      });
      if (res.ok) {
        setNewTagName("");
        loadConfig();
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  DevPulse Super Admin Portal
                </h1>
                <p className="text-xs text-slate-400">
                  Platform governance, real-time analytics, user moderation, and system
                  configuration.
                </p>
              </div>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#141c2e] text-amber-400 border border-amber-500/20 self-start sm:self-auto">
            Authenticated as: {user.name} ({user.email})
          </span>
        </div>

        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-500/40 text-xs sm:text-sm text-indigo-200 animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#1f293d] pb-2 text-xs sm:text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors ${
              activeTab === "overview"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            Platform Overview
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors ${
              activeTab === "users"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            User Management ({stats?.totalUsers || 0})
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === "reports"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            <span>Moderation Reports</span>
            {(stats?.pendingReports ?? 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-[10px] text-white">
                {stats?.pendingReports}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("announcements")}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors ${
              activeTab === "announcements"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            Announcements
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors ${
              activeTab === "categories"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            Categories & Tags
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors ${
              activeTab === "logs"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            Audit Logs
          </button>
        </div>

        {/* Tab 1: Platform Overview Metrics */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {loadingStats ? (
              <div className="py-20 text-center text-slate-400">Loading platform records...</div>
            ) : (
              <>
                {/* 6 Key Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-[#111827] border border-[#1f293d] space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-semibold">Total Developers</span>
                      <Users className="h-4 w-4 text-indigo-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.totalUsers}</p>
                    <p className="text-[11px] text-emerald-400">
                      {stats?.activeUsers} Active Accounts
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#111827] border border-[#1f293d] space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-semibold">Verified Users</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.verifiedUsers}</p>
                    <p className="text-[11px] text-slate-400">Email verified</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#111827] border border-[#1f293d] space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-semibold">Showcase Projects</span>
                      <FolderGit2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.totalProjects}</p>
                    <p className="text-[11px] text-slate-400">Published to gallery</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#111827] border border-[#1f293d] space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-semibold">Community Posts</span>
                      <MessageSquare className="h-4 w-4 text-sky-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.totalPosts}</p>
                    <p className="text-[11px] text-slate-400">
                      {stats?.totalComments} Comments total
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#111827] border border-[#1f293d] space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-semibold">DevReels Videos</span>
                      <Video className="h-4 w-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.totalVideos}</p>
                    <p className="text-[11px] text-slate-400">Project demonstrations</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#111827] border border-[#1f293d] space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-semibold">Pending Reports</span>
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats?.pendingReports}</p>
                    <p className="text-[11px] text-amber-400">Requires review</p>
                  </div>
                </div>

                {/* Audit Log preview */}
                <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-400" />
                    Recent Administrative Actions
                  </h3>
                  <div className="divide-y divide-[#1f293d]/60 text-xs">
                    {auditLogs.slice(0, 6).map((log) => (
                      <div key={log.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-200">{log.action}: </span>
                          <span className="text-slate-400">{log.target}</span>
                          {log.details && (
                            <span className="text-slate-500 block text-[11px]">{log.details}</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 shrink-0">
                          {timeAgo(log.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: User Management */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, username, or email address..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#111827] border border-[#1f293d] text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full sm:w-40 h-10 px-3 rounded-xl bg-[#111827] border border-[#1f293d] text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">Regular Users</option>
                <option value="MODERATOR">Moderators</option>
                <option value="ADMIN">Super Admins</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="w-full sm:w-40 h-10 px-3 rounded-xl bg-[#111827] border border-[#1f293d] text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-[#1f293d] bg-[#111827] overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b0f19] border-b border-[#1f293d] text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="p-3.5">Developer</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Activity</th>
                    <th className="p-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f293d]">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Searching users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No accounts match your criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#141c2e]/50 transition-colors">
                        <td className="p-3.5">
                          <Link
                            href={`/profile/${u.username}`}
                            className="flex items-center gap-2 group"
                          >
                            <img
                              src={
                                u.avatarUrl ||
                                `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`
                              }
                              alt={u.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-bold text-white group-hover:text-indigo-400">
                                {u.name}
                              </p>
                              <p className="text-[11px] text-slate-400">@{u.username}</p>
                            </div>
                          </Link>
                        </td>

                        <td className="p-3.5 text-slate-300">{u.email}</td>

                        <td className="p-3.5">
                          <select
                            value={u.role}
                            onChange={(e) => handleUserAction(u.id, "ROLE_CHANGE", e.target.value)}
                            disabled={u.email === "admin@devpulse.io"}
                            className="bg-[#0b0f19] border border-[#1f293d] text-slate-200 text-xs rounded-lg px-2 py-1"
                          >
                            <option value="USER">User</option>
                            <option value="MODERATOR">Moderator</option>
                            <option value="ADMIN">Super Admin</option>
                          </select>
                        </td>

                        <td className="p-3.5">
                          {u.isBanned ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-500/30">
                              Banned
                            </span>
                          ) : u.isSuspended ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-500/30">
                              Suspended
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-slate-400">
                          {u._count.projects} projects • {u._count.posts} posts
                        </td>

                        <td className="p-3.5 text-right space-x-1.5">
                          {u.isSuspended || u.isBanned ? (
                            <button
                              onClick={() => handleUserAction(u.id, "RESTORE")}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                            >
                              Restore
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleUserAction(u.id, "SUSPEND")}
                                disabled={u.email === "admin@devpulse.io"}
                                className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-medium"
                              >
                                Suspend
                              </button>
                              <button
                                onClick={() => handleUserAction(u.id, "BAN")}
                                disabled={u.email === "admin@devpulse.io"}
                                className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-medium"
                              >
                                Ban
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Content Moderation Reports */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Community Moderation Reports</h2>
              <button onClick={loadReports} className="text-xs text-indigo-400 hover:underline">
                Refresh reports
              </button>
            </div>

            {loadingReports ? (
              <div className="py-16 text-center text-slate-400 text-xs">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#1f293d] p-12 text-center text-slate-400 text-sm">
                No content reports submitted. The community is clean!
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          {report.targetType} REPORT
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            report.status === "PENDING"
                              ? "bg-red-950 text-red-400"
                              : "bg-emerald-950 text-emerald-400"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{timeAgo(report.createdAt)}</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-slate-300">
                        <strong className="text-white">Target: </strong>
                        {report.targetSummary}
                      </p>
                      <p className="text-slate-300">
                        <strong className="text-white">Reported Reason: </strong>
                        &ldquo;{report.reason}&rdquo;
                      </p>
                      <p className="text-slate-500">
                        Reporter: {report.reporter?.name} (@{report.reporter?.username})
                      </p>
                    </div>

                    {report.status === "PENDING" && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f293d]">
                        <button
                          onClick={() => handleReportAction(report.id, "DISMISSED")}
                          className="px-3 py-1.5 rounded-lg bg-[#141c2e] hover:bg-[#1f293d] text-slate-300 text-xs font-semibold"
                        >
                          Dismiss Report
                        </button>

                        <button
                          onClick={() => {
                            handleDeleteContent(report.targetType, report.targetId);
                            handleReportAction(report.id, "RESOLVED");
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                        >
                          Delete Infringing {report.targetType}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Platform Announcements */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            <form
              onSubmit={handleCreateAnnouncement}
              className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 space-y-4"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-indigo-400" />
                Publish Global Platform Announcement
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scheduled Maintenance or Hackathon Announcement"
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Type</label>
                  <select
                    value={newAnnType}
                    onChange={(e) => setNewAnnType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="INFO">Info (Blue)</option>
                    <option value="SUCCESS">Success (Green)</option>
                    <option value="ALERT">Alert (Red)</option>
                  </select>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Announcement Content
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Broadcast text shown in the top notification banner across DevPulse..."
                    value={newAnnContent}
                    onChange={(e) => setNewAnnContent(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Publish Announcement
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Active & Past Announcements
              </h3>
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="rounded-2xl border border-[#1f293d] bg-[#111827] p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ann.isActive
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {ann.isActive ? "Active on Banner" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{ann.content}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleAnnouncement(ann.id, ann.isActive)}
                      className="px-3 py-1.5 rounded-lg bg-[#141c2e] hover:bg-[#1f293d] text-xs font-medium text-slate-300"
                    >
                      {ann.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Categories & Tech Tags */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories Management */}
            <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-indigo-400" />
                Project Categories
              </h3>

              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                >
                  + Add
                </button>
              </form>

              <div className="space-y-1.5 max-h-80 overflow-y-auto">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-xs text-slate-300"
                  >
                    <span>{c.name}</span>
                    <button
                      onClick={async () => {
                        await fetch("/api/admin/categories", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ type: "CATEGORY", id: c.id }),
                        });
                        loadConfig();
                      }}
                      className="text-slate-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Tags Management */}
            <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-400" />
                Official Tech Stack Tags
              </h3>

              <form onSubmit={handleCreateTag} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New tech tag (e.g. WebGPU, Zig)..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                >
                  + Add
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5 max-h-80 overflow-y-auto">
                {techTags.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-indigo-300"
                  >
                    {t.name}
                    <button
                      onClick={async () => {
                        await fetch("/api/admin/categories", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ type: "TECH_TAG", id: t.id }),
                        });
                        loadConfig();
                      }}
                      className="text-slate-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Audit Logs */}
        {activeTab === "logs" && (
          <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-400" />
              Administrative Audit Log Trail
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b0f19] border-b border-[#1f293d] text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Admin</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target</th>
                    <th className="p-3">Details / Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f293d]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#141c2e]/40">
                      <td className="p-3 text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-white">{log.admin?.name || "Admin"}</td>
                      <td className="p-3">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{log.target}</td>
                      <td className="p-3 text-slate-400">{log.details || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
