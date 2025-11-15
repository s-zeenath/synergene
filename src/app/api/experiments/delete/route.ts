import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function DELETE(req: NextRequest) {
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

    let id = req.nextUrl.searchParams.get("id") || "";
    if (!id) { try { const b = await req.json(); id = b?.id ?? ""; } catch {} }
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const row = await db.experiment.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found (id)" }, { status: 404 });
    if (row.userId !== dbUser.id) return NextResponse.json({ error: "Forbidden (owner)" }, { status: 403 });

    try {
      await db.experiment.delete({ where: { id } });
      return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    } catch (e: any) {
      if (e?.code === "P2003") {
        return NextResponse.json(
          { error: "This experiment has linked records. Delete them first or enable cascade.", code: "FK_CONSTRAINT" },
          { status: 409 }
        );
      }
      throw e;
    }
  } catch (e: any) {
    console.error("DELETE /api/experiments/delete:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const clerk = await currentUser();
  if (!clerk) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const dbUser = await db.user.findUnique({ where: { clerkUserId: clerk.id } });
  if (!dbUser) return NextResponse.json({ error: "User not provisioned" }, { status: 404 });

  const row = await db.experiment.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Not found (id)" }, { status: 404 });
  if (row.userId !== dbUser.id) return NextResponse.json({ error: "Forbidden (owner)" }, { status: 403 });

  try {
    await db.experiment.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    if (e?.code === "P2003") {
      return NextResponse.json(
        { error: "This experiment has linked records. Delete them first or enable cascade.", code: "FK_CONSTRAINT" },
        { status: 409 }
      );
    }
    throw e;
  }
}