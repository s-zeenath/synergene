/*
  Warnings:

  - You are about to drop the `Record` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- DropForeignKey
ALTER TABLE "public"."Record" DROP CONSTRAINT "Record_userId_fkey";

-- DropTable
DROP TABLE "public"."Record";

-- CreateTable
CREATE TABLE "Drug" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target" TEXT,
    "mechanism" TEXT,
    "associates" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CellLine" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tissue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CellLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "drugAId" TEXT NOT NULL,
    "drugBId" TEXT NOT NULL,
    "cellLineId" TEXT NOT NULL,
    "targetA" TEXT,
    "targetB" TEXT,
    "synergy" DOUBLE PRECISION NOT NULL,
    "confidence" "Confidence" NOT NULL,
    "bestConcA" DOUBLE PRECISION,
    "bestConcB" DOUBLE PRECISION,
    "patientDataUrl" TEXT,
    "heatmap" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drugAId" TEXT NOT NULL,
    "drugBId" TEXT NOT NULL,
    "cellLineId" TEXT NOT NULL,
    "targetA" TEXT,
    "targetB" TEXT,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSynergistic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Drug_name_key" ON "Drug"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CellLine_code_key" ON "CellLine"("code");

-- CreateIndex
CREATE INDEX "Prediction_userId_createdAt_idx" ON "Prediction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Prediction_cellLineId_idx" ON "Prediction"("cellLineId");

-- CreateIndex
CREATE INDEX "Prediction_drugAId_drugBId_idx" ON "Prediction"("drugAId", "drugBId");

-- CreateIndex
CREATE INDEX "Experiment_testedAt_idx" ON "Experiment"("testedAt");

-- CreateIndex
CREATE INDEX "Experiment_cellLineId_idx" ON "Experiment"("cellLineId");

-- CreateIndex
CREATE INDEX "Experiment_drugAId_drugBId_idx" ON "Experiment"("drugAId", "drugBId");

-- CreateIndex
CREATE INDEX "Report_userId_createdAt_idx" ON "Report"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_drugAId_fkey" FOREIGN KEY ("drugAId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_drugBId_fkey" FOREIGN KEY ("drugBId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_cellLineId_fkey" FOREIGN KEY ("cellLineId") REFERENCES "CellLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_drugAId_fkey" FOREIGN KEY ("drugAId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_drugBId_fkey" FOREIGN KEY ("drugBId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_cellLineId_fkey" FOREIGN KEY ("cellLineId") REFERENCES "CellLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
