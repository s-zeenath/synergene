import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

type Body = {
  drugA?: string;
  drugB?: string;
  concA?: string | number;
  concB?: string | number;
  cellLine?: string;
  metricType?: string;
  metricValue?: string | number;
  notes?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const primaryEmail =
      user.emailAddresses?.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ??
      user.emailAddresses?.[0]?.emailAddress ??
      `${user.id}@no-email.local`;

    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.username ||
      "User";

    const dbUser = await db.user.upsert({
      where: { clerkUserId: user.id },
      update: { email: primaryEmail, name: displayName, imageUrl: user.imageUrl ?? null },
      create: { clerkUserId: user.id, email: primaryEmail, name: displayName, imageUrl: user.imageUrl ?? null },
    });

    const body: Body = await req.json();
    const { drugA, drugB, concA, concB, cellLine, metricType, metricValue, notes } = body || {};

    if (!drugA || !drugB || !cellLine || concA == null || concB == null)
      return NextResponse.json({ success: false, error: "drugA, drugB, concA, concB, cellLine are required" }, { status: 400 });

    if (!metricType || metricValue == null)
      return NextResponse.json({ success: false, error: "metricType and metricValue are required (viability | synergy)" }, { status: 400 });

    const a = Number(concA);
    const b = Number(concB);
    const mVal = Number(metricValue);
    if ([a, b, mVal].some(Number.isNaN))
      return NextResponse.json({ success: false, error: "concA, concB, metricValue must be numeric" }, { status: 400 });

    const type = String(metricType).trim().toLowerCase();
    const metricTypeEnum = type === "viability" ? "VIABILITY" : type === "synergy" ? "SYNERGY" : null;
    if (!metricTypeEnum)
      return NextResponse.json({ success: false, error: "metricType must be 'viability' or 'synergy'" }, { status: 400 });

    const exp = await db.experiment.create({
      data: {
        userId: dbUser.id,
        drugA, drugB,
        concA: a, concB: b,
        cellLine,
        metricType: metricTypeEnum as any,
        metricValue: mVal,
        notes: notes ?? null,
      },
    });

    return NextResponse.json({ success: true, experiment: exp });
  } catch (e) {
    console.error("Log experiment error:", e);
    return NextResponse.json({ success: false, error: "Failed to log experiment" }, { status: 500 });
  }
}