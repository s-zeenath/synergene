import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const drugs = await prisma.drugCombination.findMany({
      select: {
        drugA: true,
        drugB: true,
      },
    });

    const uniqueDrugs = Array.from(
      new Set([
        ...drugs.map(d => d.drugA),
        ...drugs.map(d => d.drugB)
      ])
    ).sort();

    return NextResponse.json({ success: true, drugs: uniqueDrugs });
  } catch (error) {
    console.error('Error fetching available drugs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch drugs' }, { status: 500 });
  }
}