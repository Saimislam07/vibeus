import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json(); // ACCEPTED or DECLINED
    if (!["ACCEPTED", "DECLINED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const connection = await prisma.connection.findUnique({
      where: { id },
      include: { sender: true },
    });

    if (!connection) {
      return NextResponse.json({ error: "Connection request not found" }, { status: 404 });
    }

    // Only receiver can accept/decline
    if (connection.receiverId !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to respond to this request" },
        { status: 403 },
      );
    }

    if (status === "DECLINED") {
      await prisma.connection.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Connection request declined" });
    }

    const updated = await prisma.connection.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });

    // Notify original sender that their request was accepted
    await prisma.notification.create({
      data: {
        recipientId: connection.senderId,
        senderId: user.id,
        type: "CONNECTION_ACCEPTED",
        title: "Connection Accepted",
        message: `${user.name} accepted your connection request. You are now connected!`,
        link: `/profile/${user.username}`,
      },
    });

    return NextResponse.json({
      success: true,
      connection: updated,
      message: "Connection request accepted",
    });
  } catch (error) {
    console.error("Error updating connection:", error);
    return NextResponse.json({ error: "Failed to update connection" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connection = await prisma.connection.findUnique({ where: { id } });
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Must be sender or receiver
    if (connection.senderId !== user.id && connection.receiverId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.connection.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Connection removed successfully" });
  } catch (error) {
    console.error("Error deleting connection:", error);
    return NextResponse.json({ error: "Failed to remove connection" }, { status: 500 });
  }
}
