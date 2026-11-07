"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { timeAgo } from "@/lib/utils";
import type { NotificationItem } from "@/lib/types";
import {
  Bell,
  ThumbsUp,
  MessageSquare,
  UserPlus,
  CheckCheck,
  Megaphone,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function NotificationsPage() {
  const { user, refreshUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let active = true;
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (active) setNotifications(data.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchNotifications();
    return () => {
      active = false;
    };
  }, [user]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "POST_LIKE":
      case "PROJECT_LIKE":
        return <ThumbsUp className="h-4 w-4 text-indigo-400" />;
      case "POST_COMMENT":
      case "PROJECT_COMMENT":
        return <MessageSquare className="h-4 w-4 text-emerald-400" />;
      case "CONNECTION_REQUEST":
      case "CONNECTION_ACCEPTED":
        return <UserPlus className="h-4 w-4 text-amber-400" />;
      default:
        return <Megaphone className="h-4 w-4 text-sky-400" />;
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1 p-16 text-center space-y-3">
          <Bell className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">Sign In Required</h2>
          <p className="text-xs text-slate-400">
            Please sign in to view your in-app notifications.
          </p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Sign In
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-indigo-400" />
              Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Real-time activity alerts on your posts, projects, and connections.
            </p>
          </div>

          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141c2e] hover:bg-[#1f293d] border border-[#1f293d] text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <CheckCheck className="h-4 w-4 text-indigo-400" />
            <span>Mark all as read</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
            <p className="text-xs text-slate-400">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1f293d] p-12 text-center space-y-3">
            <Bell className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No notifications yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When peers like your projects, leave feedback, or send connection requests, you will
              see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-w-3xl">
            {notifications.map((notif) => (
              <Link
                key={notif.id}
                href={notif.link || "#"}
                className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all ${
                  notif.isRead
                    ? "bg-[#111827] border-[#1f293d] text-slate-400 hover:bg-[#141c2e]"
                    : "bg-[#141c2e] border-indigo-500/30 text-slate-200 hover:bg-[#18233a] shadow-sm"
                }`}
              >
                <div className="p-2 rounded-xl bg-[#0b0f19] border border-[#1f293d] shrink-0 mt-0.5">
                  {getIconForType(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                    <span className="text-[11px] text-slate-500 shrink-0">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                </div>

                <ExternalLink className="h-4 w-4 text-slate-600 shrink-0 self-center" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
