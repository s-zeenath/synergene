import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const drug1 = searchParams.get('drug1');
    const drug2 = searchParams.get('drug2');

    if (!drug1 || !drug2) {
      return NextResponse.json({ success: false, error: 'Both drug1 and drug2 parameters are required' }, { status: 400 });
    }

    const combinations = await prisma.drugCombination.findMany({
      where: {
        OR: [
          { drugA: drug1, drugB: drug2 },
          { drugA: drug2, drugB: drug1 }
        ]
      },
      select: {
        cellLine: true,
      },
    });

    const uniqueCellLines = Array.from(
      new Set(combinations.map(combo => combo.cellLine))
    ).sort();

    const cellLines = uniqueCellLines.map(cellLine => ({
      value: cellLine,
      label: cellLine
    }));

    return NextResponse.json({ success: true, cellLines });
  } catch (error) {
    console.error('Error fetching available cell lines:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch cell lines' }, { status: 500 });
  }
}