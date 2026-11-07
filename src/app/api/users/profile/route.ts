import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      avatarUrl,
      coverUrl,
      bio,
      district,
      country,
      skills,
      experienceLevel,
      learningGoals,
      githubUrl,
      portfolioUrl,
      linkedinUrl,
      twitterUrl,
      isProfilePublic,
      showEmail,
    } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name.trim() : user.name,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : user.avatarUrl,
        coverUrl: coverUrl !== undefined ? coverUrl : user.coverUrl,
        bio: bio !== undefined ? bio.trim() : user.bio,
        district: district !== undefined ? district.trim() : user.district,
        country: country !== undefined ? country.trim() : user.country,
        skills: skills !== undefined ? skills.trim() : user.skills,
        experienceLevel:
          experienceLevel !== undefined ? experienceLevel.trim() : user.experienceLevel,
        learningGoals: learningGoals !== undefined ? learningGoals.trim() : user.learningGoals,
        githubUrl: githubUrl !== undefined ? githubUrl.trim() : user.githubUrl,
        portfolioUrl: portfolioUrl !== undefined ? portfolioUrl.trim() : user.portfolioUrl,
        linkedinUrl: linkedinUrl !== undefined ? linkedinUrl.trim() : user.linkedinUrl,
        twitterUrl: twitterUrl !== undefined ? twitterUrl.trim() : user.twitterUrl,
        isProfilePublic:
          isProfilePublic !== undefined ? Boolean(isProfilePublic) : user.isProfilePublic,
        showEmail: showEmail !== undefined ? Boolean(showEmail) : user.showEmail,
      },
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
        isProfilePublic: true,
        showEmail: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
