import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const drug1 = searchParams.get('drug1');

    if (!drug1) {
      return NextResponse.json({ success: false, error: 'Drug1 parameter is required' }, { status: 400 });
    }

    const combinations = await prisma.drugCombination.findMany({
      where: {
        OR: [
          { drugA: drug1 },
          { drugB: drug1 }
        ]
      },
      select: {
        drugA: true,
        drugB: true,
      },
    });

    const pairedDrugs = combinations
      .map(combo => combo.drugA === drug1 ? combo.drugB : combo.drugA)
      .filter((drug, index, self) => self.indexOf(drug) === index) // Remove duplicates
      .sort();

    return NextResponse.json({ success: true, drugs: pairedDrugs });
  } catch (error) {
    console.error('Error fetching available drug pairs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch drug pairs' }, { status: 500 });
  }
}