import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

const JWT_SECRET =
  process.env.JWT_SECRET || "devpulse-jwt-secret-key-32chars-minimum-developer-community-2026";
const COOKIE_NAME = "devpulse_session";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  username: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload, rememberMe: boolean = true): string {
  const expiresIn = rememberMe ? "30d" : "1d";
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string, rememberMe: boolean = true) {
  const cookieStore = await cookies();
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatarUrl: true,
        coverUrl: true,
        bio: true,
        district: true,
        country: true,
        skills: true,
        experienceLevel: true,
        learningGoals: true,
        githubUrl: true,
        portfolioUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        role: true,
        isVerified: true,
        isSuspended: true,
        isBanned: true,
        isProfilePublic: true,
        showEmail: true,
        createdAt: true,
      },
    });

    if (!user || user.isBanned || user.isSuspended) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN_NOT_ADMIN");
  }
  return user;
}
