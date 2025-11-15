import { PrismaClient, Confidence } from "@prisma/client";
const prisma = new PrismaClient();

/** Pick (or create) the correct internal User by Clerk ID */
async function pickUserId() {
  const clerkId = process.env.SEED_CLERK_USER_ID;
  if (clerkId) {
    // find or create the User row tied to your Clerk user
    const existing = await prisma.user.findUnique({ where: { clerkUserId: clerkId } });
    if (existing) return existing.id;

    const created = await prisma.user.create({
      data: {
        clerkUserId: clerkId,
        email: "aysha.1.1.8.2.4@gmail.com", // safe placeholder; change if you want
        name: "Aysha Aldarmaki",
      },
    });
    return created.id;
  }

  const u = await prisma.user.findFirst();
  if (!u) throw new Error("No users found. Sign in once, or set SEED_CLERK_USER_ID.");
  return u.id;
}

/** Ensure master data exists so FKs won’t fail */
async function ensureDrugs(names: string[]) {
  await Promise.all(
    names.map((name) =>
      prisma.drug.upsert({ where: { name }, update: {}, create: { name } })
    )
  );
}
async function ensureCellLines(codes: string[]) {
  await Promise.all(
    codes.map((code) =>
      prisma.cellLine.upsert({ where: { code }, update: {}, create: { code } })
    )
  );
}
async function idForDrug(name: string) {
  const d = await prisma.drug.findUnique({ where: { name } });
  if (!d) throw new Error(`Drug not found by name: ${name}`);
  return d.id;
}
async function idForCell(code: string) {
  const c = await prisma.cellLine.findUnique({ where: { code } });
  if (!c) throw new Error(`Cell line not found by code: ${code}`);
  return c.id;
}

async function main() {
  const userId = await pickUserId();

  // ---- EDIT/ADD your legacy rows here ----
  const rows = [
    {
      name: "Legacy - Doxorubicin + Trametinib (MCF7)",
      drugAName: "Doxorubicin",
      drugBName: "Trametinib",
      cellCode: "MCF7",
      concentrationA: 1.0,
      concentrationB: 0.1,
      synergyScore: 12.8,
      confidence: 0.92,
      confidenceLevel: Confidence.HIGH,
    },
    {
      name: "Legacy - Paclitaxel + Gefitinib (A549)",
      drugAName: "Paclitaxel",
      drugBName: "Gefitinib",
      cellCode: "A549",
      concentrationA: 0.5,
      concentrationB: 0.2,
      synergyScore: -3.4,
      confidence: 0.63,
      confidenceLevel: Confidence.MEDIUM,
    },
    {
      name: "Legacy - Sorafenib + Vorinostat (HCT116)",
      drugAName: "Sorafenib",
      drugBName: "Vorinostat",
      cellCode: "HCT116",
      concentrationA: 2.0,
      concentrationB: 0.5,
      synergyScore: 7.1,
      confidence: 0.88,
      confidenceLevel: Confidence.HIGH,
    },
  ];
  // ----------------------------------------

  // Make sure master tables contain what we reference
  await ensureDrugs([...new Set(rows.flatMap(r => [r.drugAName, r.drugBName]))]);
  await ensureCellLines([...new Set(rows.map(r => r.cellCode))]);

  // Resolve FK ids and seed predictions (fresh timestamps so they pass the 30-day filter)
  const data = [];
  for (const r of rows) {
    const [drugAId, drugBId, cellLineId] = await Promise.all([
      idForDrug(r.drugAName),
      idForDrug(r.drugBName),
      idForCell(r.cellCode),
    ]);

    data.push({
      userId,
      name: r.name,
      drugAId,
      drugBId,
      cellLineId,
      concentrationA: r.concentrationA,
      concentrationB: r.concentrationB,
      synergyScore: r.synergyScore,
      confidence: r.confidence,
      confidenceLevel: r.confidenceLevel,
      createdAt: new Date(), // ensure within last 30 days
    });
  }

  await prisma.prediction.createMany({ data, skipDuplicates: true });
  console.log("✅ Seeded legacy predictions into Prediction.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });