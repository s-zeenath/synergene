import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.user.findUnique({ where: { clerkUserId: user.id } });
    if (!dbUser) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

    const exp = await db.experiment.findUnique({ where: { id } });
    if (!exp || exp.userId !== dbUser.id) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, experiment: exp });
  } catch (e) {
    console.error("Get experiment error:", e);
    return NextResponse.json({ success: false, error: "Failed to get experiment" }, { status: 500 });
  }
}