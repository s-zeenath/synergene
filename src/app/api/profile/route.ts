import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const clerk = await currentUser();
    if (!clerk) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null) as
      | { name?: string; imageUrl?: string | null }
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const name = (body.name ?? "").trim().slice(0, 120);
    const imageUrl =
      body.imageUrl === null
        ? null
        : (body.imageUrl ?? "").toString().slice(0, 1000);

    const data: Prisma.UserUpdateInput = {};
    if (name) data.name = name;
    if (typeof imageUrl !== "undefined") data.imageUrl = imageUrl;

    const updated = await db.user.update({
      where: { clerkUserId: clerk.id },
      data,
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
