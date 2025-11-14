import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  const clerk = await currentUser();
  if (!clerk) return NextResponse.json({ experiments: [] }, { status: 401 });

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

  const rows = await db.experiment.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  const experiments = rows.map(r => ({
    id: r.id,
    date: r.createdAt.toISOString().slice(0, 10),
    drugA: r.drugA,
    drugB: r.drugB,
    concA: r.concA,
    concB: r.concB,
    cellLine: r.cellLine,
    metricType: r.metricType,
    metricValue: r.metricValue,
    notes: r.notes ?? "",
  }));

  return NextResponse.json({ experiments }, { headers: { "Cache-Control": "no-store" } });
}