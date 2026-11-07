"use client";

import React, { useState, useEffect } from "react";
import { Megaphone, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { AnnouncementItem } from "@/lib/types";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data.announcements && data.announcements.length > 0) {
          const active = data.announcements.filter((a: AnnouncementItem) => a.isActive);
          setAnnouncements(active);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  if (dismissed || announcements.length === 0) return null;

  const current = announcements[0];

  return (
    <div className="relative border-b border-indigo-500/20 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-950/70 px-4 py-2.5 text-xs text-slate-200">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
            <Megaphone className="h-3 w-3" />
          </span>
          <span className="font-semibold text-white shrink-0">{current.title}:</span>
          <span className="truncate text-slate-300">{current.content}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
