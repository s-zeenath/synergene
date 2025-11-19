import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function DELETE(req: NextRequest) {
  try {
    const clerk = await currentUser();
    if (!clerk) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.user.findUnique({ 
      where: { clerkUserId: clerk.id } 
    });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Check if prediction exists and belongs to user
    const existingPrediction = await db.prediction.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingPrediction) return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
    if (existingPrediction.userId !== dbUser.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Delete the prediction
    await db.prediction.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting prediction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}