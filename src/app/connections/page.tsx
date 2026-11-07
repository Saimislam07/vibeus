"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import {
  Users2,
  UserPlus,
  Check,
  X,
  MapPin,
  BadgeCheck,
  Loader2,
  UserMinus,
  MessageSquare,
} from "lucide-react";
import { parseTags } from "@/lib/utils";
import type { ConnectedDeveloperItem, ConnectionRequestItem } from "@/lib/types";

export default function ConnectionsPage() {
  const { user, refreshUser } = useAuth();
  const [connections, setConnections] = useState<ConnectedDeveloperItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
        setIncomingRequests(data.incomingRequests || []);
        setOutgoingRequests(data.outgoingRequests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    let active = true;
    const loadConnections = async () => {
      try {
        const res = await fetch("/api/connections");
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setConnections(data.connections || []);
        setIncomingRequests(data.incomingRequests || []);
        setOutgoingRequests(data.outgoingRequests || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadConnections();
    return () => {
      active = false;
    };
  }, [user]);

  const handleAccept = async (reqId: string) => {
    try {
      const res = await fetch(`/api/connections/${reqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });
      if (res.ok) {
        await fetchConnections();
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (reqId: string) => {
    try {
      const res = await fetch(`/api/connections/${reqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DECLINED" }),
      });
      if (res.ok) {
        await fetchConnections();
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrRemove = async (connectionId: string) => {
    if (!confirm("Are you sure you want to remove this connection?")) return;
    try {
      const res = await fetch(`/api/connections/${connectionId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchConnections();
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1 p-16 text-center space-y-3">
          <Users2 className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">Sign In Required</h2>
          <p className="text-xs text-slate-400">
            Please sign in to view and build your developer network.
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users2 className="h-6 w-6 text-indigo-400" />
            Developer Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your professional developer connections and incoming invitations.
          </p>
        </div>

        {/* Incoming Requests Section (If Any) */}
        {incomingRequests.length > 0 && (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
              Pending Invitations ({incomingRequests.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-[#1f293d]"
                >
                  <Link
                    href={`/profile/${req.user.username}`}
                    className="flex items-center gap-2.5 min-w-0 group"
                  >
                    <img
                      src={
                        req.user.avatarUrl ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${req.user.username}`
                      }
                      alt={req.user.name}
                      className="h-10 w-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-indigo-400 truncate">
                        {req.user.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">@{req.user.username}</p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                      title="Accept"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDecline(req.id)}
                      className="p-1.5 rounded-lg bg-[#141c2e] hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                      title="Decline"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outgoing Requests Section */}
        {outgoingRequests.length > 0 && (
          <div className="rounded-2xl border border-[#1f293d] bg-[#111827] p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sent Requests Pending Response ({outgoingRequests.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {outgoingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0b0f19] border border-[#1f293d]"
                >
                  <Link
                    href={`/profile/${req.user.username}`}
                    className="flex items-center gap-2.5 min-w-0 group"
                  >
                    <img
                      src={
                        req.user.avatarUrl ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${req.user.username}`
                      }
                      alt={req.user.name}
                      className="h-9 w-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white group-hover:text-indigo-400 truncate">
                        {req.user.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">@{req.user.username}</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleCancelOrRemove(req.id)}
                    className="px-2.5 py-1 rounded-md text-[11px] bg-[#141c2e] hover:bg-red-950/40 text-slate-400 hover:text-red-400"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connected Developers List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Connected Developers ({connections.length})
            </h2>
            <Link href="/explore" className="text-xs text-indigo-400 hover:underline">
              + Find More Developers
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mx-auto" />
              <p className="text-xs text-slate-400">Loading network...</p>
            </div>
          ) : connections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1f293d] p-12 text-center space-y-3">
              <Users2 className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-white">No connections yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Connect with engineers to see their updates in your &ldquo;My Network&rdquo;
                community feed.
              </p>
              <Link
                href="/explore"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Discover Developers
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((dev) => {
                const skills = parseTags(dev.skills);
                return (
                  <div
                    key={dev.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#1f293d] bg-[#111827] p-5 space-y-4"
                  >
                    <div className="space-y-3">
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

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {dev.bio || "Developer on DevPulse"}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded bg-[#0b0f19] text-indigo-300 border border-[#1f293d]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#1f293d]">
                      <Link
                        href={`/messages?userId=${dev.id}`}
                        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat</span>
                      </Link>

                      <button
                        onClick={() => handleCancelOrRemove(dev.connectionId)}
                        className="text-[11px] text-slate-500 hover:text-red-400"
                        title="Remove connection"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
