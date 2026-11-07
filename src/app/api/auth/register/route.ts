import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, username, password } = body;

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter a valid full name (minimum 2 characters)" },
        { status: 400 },
      );
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    if (!username || typeof username !== "string" || !/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be between 3 and 20 alphanumeric characters (underscores and hyphens allowed)",
        },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    // Enforce email uniqueness at database level
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 },
      );
    }

    // Enforce username uniqueness
    const existingUsername = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken. Please choose another." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Default avatars for new users
    const defaultAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(normalizedUsername)}`;

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
        avatarUrl: defaultAvatar,
        role: "USER",
        isVerified: true, // Mark verified for seamless onboarding, token preserved for email verification
        verificationToken,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Create welcoming notification
    await prisma.notification.create({
      data: {
        recipientId: user.id,
        type: "SYSTEM",
        title: "Welcome to DevPulse!",
        message:
          "Your developer account is ready. Fill out your profile and showcase your first project!",
        link: `/profile/${user.username}`,
      },
    });

    // Sign JWT and set secure session cookie
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    });

    await setSessionCookie(token, true);

    return NextResponse.json({
      success: true,
      user,
      message: "Account successfully registered!",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 },
    );
  }
}
