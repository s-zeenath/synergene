import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const clerk = await currentUser();
    if (!clerk) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const primaryEmail =
      clerk.emailAddresses?.find(e => e.id === clerk.primaryEmailAddressId)?.emailAddress ??
      clerk.emailAddresses?.[0]?.emailAddress ??
      `${clerk.id}@no-email.local`;
    const displayName =
      [clerk.firstName, clerk.lastName].filter(Boolean).join(" ").trim() ||
      clerk.username ||
      "User";

    const dbUser = await db.user.upsert({
      where: { clerkUserId: clerk.id },
      update: { email: primaryEmail, name: displayName, imageUrl: clerk.imageUrl ?? null },
      create: { clerkUserId: clerk.id, email: primaryEmail, name: displayName, imageUrl: clerk.imageUrl ?? null },
    });

    const b = await req.json();
    const id: string | undefined = b?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const row = await db.experiment.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found (id)" }, { status: 404 });
    if (row.userId !== dbUser.id) return NextResponse.json({ error: "Forbidden (owner)" }, { status: 403 });

    const data: any = {};
    if (b.drugA !== undefined) data.drugA = b.drugA;
    if (b.drugB !== undefined) data.drugB = b.drugB;
    if (b.concA !== undefined && b.concA !== "" && b.concA !== null) data.concA = Number(b.concA);
    if (b.concB !== undefined && b.concB !== "" && b.concB !== null) data.concB = Number(b.concB);
    if (b.cellLine !== undefined) data.cellLine = b.cellLine;
    if (b.metricType !== undefined) data.metricType = (String(b.metricType).toUpperCase() === "VIABILITY" ? "VIABILITY" : "SYNERGY");
    if (b.metricValue !== undefined && b.metricValue !== "" && b.metricValue !== null) data.metricValue = Number(b.metricValue);
    if (b.notes !== undefined) data.notes = b.notes;

    const updated = await db.experiment.update({ where: { id }, data });
    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("PATCH /api/experiments/update:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

export const POST = PATCH;