import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const clerk = await currentUser();
    if (!clerk) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await db.user.findUnique({ 
      where: { clerkUserId: clerk.id } 
    });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { id, name } = body;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!name || name.trim() === "") return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // Check if prediction exists and belongs to user
    const existingPrediction = await db.prediction.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingPrediction) return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
    if (existingPrediction.userId !== dbUser.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Update only the name
    const updatedPrediction = await db.prediction.update({
      where: { id },
      data: { name: name.trim() },
      include: {
        drugA: true,
        drugB: true,
        cellLine: true
      }
    });

    const formattedPrediction = {
      id: updatedPrediction.id,
      name: updatedPrediction.name,
      drugs: `${updatedPrediction.drugA.name} + ${updatedPrediction.drugB.name}`,
      concentrationA: updatedPrediction.concentrationA,
      concentrationB: updatedPrediction.concentrationB,
      cellLine: updatedPrediction.cellLine.id,
      score: updatedPrediction.synergyScore,
      confidence: updatedPrediction.confidence,
      confidenceLevel: updatedPrediction.confidenceLevel,
      date: updatedPrediction.createdAt.toLocaleDateString()
    };

    return NextResponse.json({ success: true, prediction: formattedPrediction });

  } catch (error) {
    console.error("Error updating prediction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}