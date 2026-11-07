import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let resetToken: string | null = null;

    if (user) {
      resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour expiration

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpires: resetExpires,
        },
      });

      console.log(`[DevPulse Password Reset] User ${user.email} reset token: ${resetToken}`);
    }

    // Never disclose if account exists to avoid email enumeration
    return NextResponse.json({
      success: true,
      message:
        "If an account exists with that email address, password reset instructions have been issued.",
      // Provide preview token for testing environment
      devResetToken: process.env.NODE_ENV !== "production" ? resetToken : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process password recovery request" },
      { status: 500 },
    );
  }
}
