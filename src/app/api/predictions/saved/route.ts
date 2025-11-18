import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!dbUser) {
      return NextResponse.json({ predictions: [] });
    }

    const savedPredictions = await db.prediction.findMany({
      where: {
        userId: dbUser.id
      },
      include: {
        drugA: true,
        drugB: true,
        cellLine: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedPredictions = savedPredictions.map(pred => ({
      id: pred.id,
      name: pred.name,
      drugs: `${pred.drugA.name} + ${pred.drugB.name}`,
      concentrationA: pred.concentrationA,
      concentrationB: pred.concentrationB,
      cellLine: pred.cellLine.id,
      score: pred.synergyScore,
      confidence: pred.confidence,
      confidenceLevel: pred.confidenceLevel,
      date: pred.createdAt.toLocaleDateString()
    }));

    return NextResponse.json({ predictions: formattedPredictions });

  } catch (error) {
    console.error('Error fetching saved predictions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/predictions/saved called');
    
    const { userId } = await auth();
    console.log('User ID:', userId);

    if (!userId) {
      console.log('No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!dbUser) {
      console.log('No database user found for clerk user:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const {
      name,
      drug1,
      drug2,
      drug1Concentration,
      drug2Concentration,
      cellLine,
      synergyScore,
      confidenceScore
    } = body;

    if (!name || !drug1 || !drug2 || !cellLine) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find drugs - create them if they don't exist
    let drugA = await db.drug.findFirst({ where: { name: drug1 } });
    let drugB = await db.drug.findFirst({ where: { name: drug2 } });

    console.log('Found drugs before creation:', { 
      drugA: drugA?.name, 
      drugB: drugB?.name 
    });

    // Create drugs if they don't exist (only name field required)
    if (!drugA) {
      drugA = await db.drug.create({
        data: {
          name: drug1
          // target is optional, so we don't need to provide it
        }
      });
      console.log('Created drug A:', drugA.name);
    }

    if (!drugB) {
      drugB = await db.drug.create({
        data: {
          name: drug2
          // target is optional, so we don't need to provide it
        }
      });
      console.log('Created drug B:', drugB.name);
    }

    console.log('Final drugs:', { drugA: drugA.name, drugB: drugB.name });

    // Find or create cell line (only basic fields required)
    let cellLineRecord = await db.cellLine.findFirst({
      where: { id: cellLine }
    });

    if (!cellLineRecord) {
      cellLineRecord = await db.cellLine.create({
        data: {
          id: cellLine
          // Only code field is required, others are automatically generated
        }
      });
      console.log('Created cell line:', cellLineRecord.id);
    }

    console.log('Final cell line:', cellLineRecord?.id);

    // Determine confidence level
    const getConfidenceLevel = (confidence: number) => {
      if (confidence >= 80) return 'HIGH';
      if (confidence >= 60) return 'MEDIUM';
      return 'LOW';
    };

    // Create saved prediction (with name)
    const prediction = await db.prediction.create({
      data: {
        userId: dbUser.id,
        name: name,
        drugAId: drugA.id,
        drugBId: drugB.id,
        cellLineId: cellLineRecord.id,
        concentrationA: parseFloat(drug1Concentration),
        concentrationB: parseFloat(drug2Concentration),
        synergyScore: parseFloat(synergyScore),
        confidence: parseFloat(confidenceScore),
        confidenceLevel: getConfidenceLevel(parseFloat(confidenceScore))
      },
      include: {
        drugA: true,
        drugB: true,
        cellLine: true
      }
    });

    console.log('Created saved prediction:', prediction.id);

    const formattedPrediction = {
      id: prediction.id,
      name: prediction.name,
      drugs: `${prediction.drugA.name} + ${prediction.drugB.name}`,
      concentrationA: prediction.concentrationA,
      concentrationB: prediction.concentrationB,
      cellLine: prediction.cellLine.id,
      score: prediction.synergyScore,
      confidence: prediction.confidence,
      confidenceLevel: prediction.confidenceLevel,
      date: prediction.createdAt.toLocaleDateString()
    };

    return NextResponse.json({ 
      success: true, 
      prediction: formattedPrediction 
    });

  } catch (error) {
    console.error('Error creating saved prediction:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}