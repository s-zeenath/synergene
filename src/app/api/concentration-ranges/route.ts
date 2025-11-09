import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const drug1 = searchParams.get('drug1');
    const drug2 = searchParams.get('drug2');
    const cellLine = searchParams.get('cellLine');

    if (!drug1 || !drug2 || !cellLine) {
      return NextResponse.json({ success: false, error: 'All parameters are required' }, { status: 400 });
    }

    const combination = await prisma.drugCombination.findFirst({
      where: {
        OR: [
          { drugA: drug1, drugB: drug2, cellLine },
          { drugA: drug2, drugB: drug1, cellLine }
        ]
      },
    });

    if (!combination) {
      return NextResponse.json({ success: false, error: 'Combination not found' }, { status: 404 });
    }

const ranges = combination.drugA === drug1 
      ? {
          minConcA: combination.minConcA,
          maxConcA: combination.maxConcA,
          minConcB: combination.minConcB,
          maxConcB: combination.maxConcB,
        }
      : {
          minConcA: combination.minConcB,
          maxConcA: combination.maxConcB,
          minConcB: combination.minConcA,
          maxConcB: combination.maxConcA,
        };

    return NextResponse.json({ success: true, ranges });
  } catch (error) {
    console.error('Error fetching concentration ranges:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch concentration ranges' }, { status: 500 });
  }
}