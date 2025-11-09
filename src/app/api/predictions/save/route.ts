// C:\Users\97155\synergene\src\app\api\predictions\save\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/predictions/save called');
    
    const user = await currentUser();
    console.log('User:', user?.id);
    
    if (!user) {
      console.log('No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user in database
    let dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id }
    });

    console.log('DB User:', dbUser);

    if (!dbUser) {
      console.log('Creating new user');
      dbUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          email: user.emailAddresses[0].emailAddress,
          name: user.fullName || user.emailAddresses[0].emailAddress,
          imageUrl: user.imageUrl,
        }
      });
      console.log('Created user:', dbUser.id);
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

    // Validate required fields
    if (!drug1 || !drug2 || !cellLine || !drug1Concentration || !drug2Concentration) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Finding/creating drugs...');
    // Find or create drugs
    const [drugA, drugB] = await Promise.all([
      db.drug.upsert({
        where: { name: drug1 },
        update: {},
        create: { name: drug1 }
      }),
      db.drug.upsert({
        where: { name: drug2 },
        update: {},
        create: { name: drug2 }
      })
    ]);

    console.log('Drugs found/created:', drugA.name, drugB.name);

    // Find or create cell line
    const cellLineRecord = await db.cellLine.upsert({
      where: { code: cellLine },
      update: {},
      create: { code: cellLine }
    });

    console.log('Cell line found/created:', cellLineRecord.code);

    // Determine confidence level based on score
    const getConfidenceLevel = (score: number) => {
      if (score >= 80) return 'HIGH';
      if (score >= 60) return 'MEDIUM';
      return 'LOW';
    };

    console.log('Creating prediction...');
    // Create prediction
    const prediction = await db.prediction.create({
      data: {
        userId: dbUser.id,
        name: name || null,
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

    console.log('Prediction created:', prediction.id);

    // Format response
    const formattedPrediction = {
      id: prediction.id,
      name: prediction.name,
      drugs: `${prediction.drugA.name} + ${prediction.drugB.name}`,
      concentrationA: prediction.concentrationA,
      concentrationB: prediction.concentrationB,
      cellLine: prediction.cellLine.code,
      synergyScore: prediction.synergyScore,
      confidence: prediction.confidence,
      confidenceLevel: prediction.confidenceLevel,
      date: prediction.createdAt.toLocaleDateString()
    };

    return NextResponse.json({
      success: true,
      prediction: formattedPrediction
    });

  } catch (error) {
    console.error('Error saving prediction:', error);
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}