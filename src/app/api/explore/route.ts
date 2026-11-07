import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const skill = searchParams.get("skill") || "";
    const country = searchParams.get("country") || "";
    const type = searchParams.get("type") || "all"; // all, developers, projects
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    const currentUser = await getCurrentUser();

    const developersWhere: Prisma.UserWhereInput = {
      isProfilePublic: true,
      isBanned: false,
    };

    if (q.trim()) {
      developersWhere.OR = [
        { name: { contains: q.trim() } },
        { username: { contains: q.trim() } },
        { bio: { contains: q.trim() } },
        { skills: { contains: q.trim() } },
      ];
    }

    if (skill) {
      developersWhere.skills = { contains: skill };
    }

    if (country) {
      developersWhere.country = { contains: country };
    }

    const [developers, totalDevelopers] = await Promise.all([
      type === "projects"
        ? Promise.resolve([])
        : prisma.user.findMany({
            where: developersWhere,
            skip: type === "developers" ? skip : 0,
            take: type === "developers" ? limit : 6,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              coverUrl: true,
              bio: true,
              district: true,
              country: true,
              skills: true,
              experienceLevel: true,
              githubUrl: true,
              portfolioUrl: true,
              isVerified: true,
              _count: {
                select: {
                  projects: true,
                  posts: true,
                },
              },
            },
          }),
      type === "projects" ? Promise.resolve(0) : prisma.user.count({ where: developersWhere }),
    ]);

    // Format developers with connection status
    const formattedDevelopers = await Promise.all(
      developers.map(async (dev) => {
        let isConnected = false;
        let isPending = false;

        if (currentUser && currentUser.id !== dev.id) {
          const conn = await prisma.connection.findFirst({
            where: {
              OR: [
                { senderId: currentUser.id, receiverId: dev.id },
                { senderId: dev.id, receiverId: currentUser.id },
              ],
            },
          });
          if (conn) {
            isConnected = conn.status === "ACCEPTED";
            isPending = conn.status === "PENDING";
          }
        }

        return {
          ...dev,
          isSelf: currentUser?.id === dev.id,
          isConnected,
          isPending,
        };
      }),
    );

    return NextResponse.json({
      developers: formattedDevelopers,
      totalDevelopers,
    });
  } catch (error) {
    console.error("Explore API error:", error);
    return NextResponse.json({ error: "Failed to explore directory" }, { status: 500 });
  }
}
