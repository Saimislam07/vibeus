import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, rememberMe = true } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please provide both email and password" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: "This account has been banned due to violations of our community guidelines." },
        { status: 403 },
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        {
          error: `This account is currently suspended. Reason: ${user.suspensionReason || "Administrative review"}`,
        },
        { status: 403 },
      );
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      Boolean(rememberMe),
    );

    await setSessionCookie(token, Boolean(rememberMe));

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    return NextResponse.json({
      success: true,
      user: sanitizedUser,
      message: "Successfully logged in!",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 },
    );
  }
}
