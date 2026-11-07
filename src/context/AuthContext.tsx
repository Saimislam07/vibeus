"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  district?: string | null;
  country?: string | null;
  skills?: string | null;
  experienceLevel?: string | null;
  learningGoals?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  role: string;
  isVerified: boolean;
  isProfilePublic?: boolean;
  showEmail?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  unreadNotifications: number;
  pendingConnections: number;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserContext: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  unreadNotifications: 0,
  pendingConnections: 0,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
  updateUserContext: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingConnections, setPendingConnections] = useState(0);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        setUnreadNotifications(data.unreadNotifications || 0);
        setPendingConnections(data.pendingConnections || 0);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Session load failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          if (active) setUser(null);
          return;
        }
        const data = await res.json();
        if (!active) return;
        setUser(data.user || null);
        setUnreadNotifications(data.unreadNotifications || 0);
        setPendingConnections(data.pendingConnections || 0);
      } catch (err) {
        console.error("Session load failed:", err);
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadSession();
    return () => {
      active = false;
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    fetchSession();
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setUnreadNotifications(0);
      setPendingConnections(0);
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const refreshUser = async () => {
    await fetchSession();
  };

  const updateUserContext = (partial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        unreadNotifications,
        pendingConnections,
        login,
        logout,
        refreshUser,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
