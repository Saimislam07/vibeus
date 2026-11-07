import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const [categories, techTags] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.techTag.findMany({ orderBy: { name: "asc" } }),
    ]);
    return NextResponse.json({ categories, techTags });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to retrieve categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await req.json();
    const { type, name, slug, description, category } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (type === "CATEGORY") {
      const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newCat = await prisma.category.create({
        data: {
          name: name.trim(),
          slug: generatedSlug,
          description: description?.trim() || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: "CREATE_CATEGORY",
          target: newCat.name,
          details: `Slug: ${newCat.slug}`,
        },
      });

      return NextResponse.json({ success: true, item: newCat });
    } else if (type === "TECH_TAG") {
      const newTag = await prisma.techTag.create({
        data: {
          name: name.trim(),
          category: category?.trim() || "General",
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: "CREATE_TECH_TAG",
          target: newTag.name,
          details: `Category: ${newTag.category}`,
        },
      });

      return NextResponse.json({ success: true, item: newTag });
    }

    return NextResponse.json({ error: "Invalid type (CATEGORY or TECH_TAG)" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ADMIN") {
      return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const { type, id } = await req.json();
    if (!id || !type)
      return NextResponse.json({ error: "ID and type are required" }, { status: 400 });

    if (type === "CATEGORY") {
      await prisma.category.delete({ where: { id } });
    } else if (type === "TECH_TAG") {
      await prisma.techTag.delete({ where: { id } });
    }

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: `DELETE_${type}`,
        target: id,
      },
    });

    return NextResponse.json({ success: true, message: "Item deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ADMIN") {
      return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
