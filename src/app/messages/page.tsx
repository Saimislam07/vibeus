"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { timeAgo } from "@/lib/utils";
import type { ConversationItem, DirectMessageItem, UserSummary } from "@/lib/types";
import { MessageSquare, Send, Loader2, BadgeCheck, User, ArrowLeft } from "lucide-react";

function MessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialPeerId = searchParams.get("userId");

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activePeerId, setActivePeerId] = useState<string | null>(initialPeerId);
  const [activePeer, setActivePeer] = useState<UserSummary | null>(null);
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(Boolean(initialPeerId));
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation list
  const loadConversations = async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        // Auto-select first if none selected
        if (!activePeerId && data.conversations && data.conversations.length > 0) {
          setActivePeerId(data.conversations[0].user.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    let active = true;
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/messages/conversations");
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setConversations(data.conversations || []);
        if (!activePeerId && data.conversations?.length > 0) {
          setLoadingMessages(true);
          setActivePeerId(data.conversations[0].user.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingConv(false);
      }
    };

    void fetchConversations();
    return () => {
      active = false;
    };
  }, [user, activePeerId]);

  // Load message thread for activePeerId
  useEffect(() => {
    if (!activePeerId) return;

    let active = true;
    const fetchThread = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${activePeerId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setMessages(data.messages || []);
        setActivePeer(data.peer || null);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingMessages(false);
      }
    };

    void fetchThread();
    return () => {
      active = false;
    };
  }, [activePeerId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePeerId || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activePeerId, content }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        loadConversations(); // refresh list
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1 p-16 text-center space-y-3">
          <MessageSquare className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">Sign In Required</h2>
          <p className="text-xs text-slate-400">Please sign in to message other developers.</p>
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
    <div className="mx-auto max-w-7xl flex h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col md:flex-row overflow-hidden border-r border-[#1f293d]">
        {/* Left: Conversations List */}
        <div
          className={`w-full md:w-80 border-r border-[#1f293d] flex flex-col bg-[#111827] shrink-0 ${activePeerId ? "hidden md:flex" : "flex"}`}
        >
          <div className="p-4 border-b border-[#1f293d]">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-400" />
              Private Messages
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1f293d]/50">
            {loadingConv ? (
              <div className="py-12 text-center text-xs text-slate-500">Loading messages...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <p>No message threads yet.</p>
                <Link href="/explore" className="text-indigo-400 hover:underline block font-medium">
                  Find developers to chat with →
                </Link>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.user.id}
                  onClick={() => {
                    setLoadingMessages(true);
                    setActivePeerId(conv.user.id);
                  }}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                    activePeerId === conv.user.id ? "bg-[#141c2e]" : "hover:bg-[#141c2e]/60"
                  }`}
                >
                  <img
                    src={
                      conv.user.avatarUrl ||
                      `https://api.dicebear.com/7.x/identicon/svg?seed=${conv.user.username}`
                    }
                    alt={conv.user.name}
                    className="h-10 w-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                        {conv.user.name}
                        {conv.user.isVerified && (
                          <BadgeCheck className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400/20" />
                        )}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {timeAgo(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {conv.lastMessage.isSender ? "You: " : ""}
                      {conv.lastMessage.content}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 self-center"></span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-[#0b0f19] ${!activePeerId ? "hidden md:flex" : "flex"}`}
        >
          {activePeer ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-[#1f293d] bg-[#111827] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActivePeerId(null)}
                    className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <Link
                    href={`/profile/${activePeer.username}`}
                    className="flex items-center gap-2.5"
                  >
                    <img
                      src={
                        activePeer.avatarUrl ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${activePeer.username}`
                      }
                      alt={activePeer.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white hover:text-indigo-400 flex items-center gap-1">
                        {activePeer.name}
                        {activePeer.isVerified && (
                          <BadgeCheck className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400/20" />
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400">@{activePeer.username}</p>
                    </div>
                  </Link>
                </div>

                <Link
                  href={`/profile/${activePeer.username}`}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  View Profile
                </Link>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="py-12 text-center text-xs text-slate-500">Loading history...</div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    This is the start of your direct conversation with {activePeer.name}.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-md px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-[#141c2e] text-slate-200 border border-[#1f293d] rounded-bl-none"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 px-1">
                          {timeAgo(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-[#1f293d] bg-[#111827] flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Message @${activePeer.username}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 h-10 px-3.5 rounded-xl bg-[#0b0f19] border border-[#1f293d] text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
              <MessageSquare className="h-12 w-12 text-slate-700" />
              <p className="text-sm font-medium text-slate-400">
                Select a developer conversation to begin chatting
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
