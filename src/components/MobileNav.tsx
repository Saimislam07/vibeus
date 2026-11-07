"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Home, Compass, Video, MessageSquare, User, PlusCircle } from "lucide-react";

export default function MobileNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-[#1f293d] bg-[#0b0f19]/95 backdrop-blur-md px-4 flex items-center justify-around">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
          pathname === "/" ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Home className="h-5 w-5" />
        <span>Feed</span>
      </Link>

      <Link
        href="/explore"
        className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
          pathname.startsWith("/explore")
            ? "text-indigo-400"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Compass className="h-5 w-5" />
        <span>Explore</span>
      </Link>

      {user && (
        <Link
          href="/projects/new"
          className="flex flex-col items-center justify-center -mt-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-2.5 shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
        >
          <PlusCircle className="h-6 w-6" />
        </Link>
      )}

      <Link
        href="/reels"
        className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
          pathname.startsWith("/reels") ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Video className="h-5 w-5" />
        <span>DevReels</span>
      </Link>

      <Link
        href={user ? `/profile/${user.username}` : "/login"}
        className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
          pathname.startsWith("/profile") || pathname === "/login"
            ? "text-indigo-400"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <User className="h-5 w-5" />
        <span>{user ? "Profile" : "Sign In"}</span>
      </Link>
    </nav>
  );
}
