import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch accepted connections
    const acceptedConnections = await prisma.connection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
            skills: true,
            experienceLevel: true,
            district: true,
            country: true,
            isVerified: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
            skills: true,
            experienceLevel: true,
            district: true,
            country: true,
            isVerified: true,
          },
        },
      },
    });

    // Format list of connected developers
    const connectedUsers = acceptedConnections.map((conn) => {
      const isSender = conn.senderId === user.id;
      const peer = isSender ? conn.receiver : conn.sender;
      return {
        connectionId: conn.id,
        connectedAt: conn.updatedAt,
        ...peer,
      };
    });

    // Fetch incoming pending requests
    const incomingPending = await prisma.connection.findMany({
      where: {
        receiverId: user.id,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
            skills: true,
            experienceLevel: true,
            district: true,
            country: true,
            isVerified: true,
          },
        },
      },
    });

    // Fetch outgoing pending requests
    const outgoingPending = await prisma.connection.findMany({
      where: {
        senderId: user.id,
        status: "PENDING",
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
            skills: true,
            experienceLevel: true,
            district: true,
            country: true,
            isVerified: true,
          },
        },
      },
    });

    return NextResponse.json({
      connections: connectedUsers,
      incomingRequests: incomingPending.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        user: r.sender,
      })),
      outgoingRequests: outgoingPending.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        user: r.receiver,
      })),
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json({ error: "Failed to retrieve connections" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId } = await req.json();

    if (!receiverId || receiverId === user.id) {
      return NextResponse.json({ error: "Invalid connection target" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, name: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Check for existing connection in either direction
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: targetUser.id },
          { senderId: targetUser.id, receiverId: user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === "ACCEPTED") {
        return NextResponse.json(
          { error: "You are already connected with this developer" },
          { status: 409 },
        );
      }
      if (existing.status === "PENDING") {
        return NextResponse.json(
          { error: "A pending connection request already exists" },
          { status: 409 },
        );
      }
    }

    const newConnection = await prisma.connection.create({
      data: {
        senderId: user.id,
        receiverId: targetUser.id,
        status: "PENDING",
      },
    });

    // Send in-app notification
    await prisma.notification.create({
      data: {
        recipientId: targetUser.id,
        senderId: user.id,
        type: "CONNECTION_REQUEST",
        title: "New Connection Request",
        message: `${user.name} sent you a connection request.`,
        link: "/connections",
      },
    });

    return NextResponse.json({
      success: true,
      connection: newConnection,
      message: "Connection request sent successfully",
    });
  } catch (error) {
    console.error("Error sending connection request:", error);
    return NextResponse.json({ error: "Failed to send connection request" }, { status: 500 });
  }
}
