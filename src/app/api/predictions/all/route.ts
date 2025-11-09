import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id }
    });

    if (!dbUser) {
      return NextResponse.json({ predictions: [] });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allPredictions = await db.prediction.findMany({
      where: {
        userId: dbUser.id,
        createdAt: { gte: thirtyDaysAgo }
      },
      include: {
        drugA: true,
        drugB: true,
        cellLine: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedPredictions = allPredictions.map(pred => ({
      id: pred.id,
      name: pred.name || `PRED_${pred.id.slice(-6).toUpperCase()}`, 
      drugs: `${pred.drugA.name} + ${pred.drugB.name}`,
      concentrationA: pred.concentrationA,
      concentrationB: pred.concentrationB,
      cellLine: pred.cellLine.code,
      score: pred.synergyScore,
      confidence: pred.confidence,
      confidenceLevel: pred.confidenceLevel,
      date: pred.createdAt.toLocaleDateString(),
      isSaved: pred.name !== null // Flag to distinguish saved vs unsaved
    }));

    return NextResponse.json({ predictions: formattedPredictions });

  } catch (error) {
    console.error('Error fetching all predictions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}