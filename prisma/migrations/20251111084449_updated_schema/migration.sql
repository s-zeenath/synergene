/*
  Warnings:

  - You are about to drop the column `bestConcA` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `bestConcB` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `heatmap` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `patientDataUrl` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `synergy` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `targetA` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `targetB` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the `Experiment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `concentrationA` to the `Prediction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `concentrationB` to the `Prediction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `confidenceLevel` to the `Prediction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `synergyScore` to the `Prediction` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `confidence` on the `Prediction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Experiment" DROP CONSTRAINT "Experiment_cellLineId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Experiment" DROP CONSTRAINT "Experiment_drugAId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Experiment" DROP CONSTRAINT "Experiment_drugBId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Experiment" DROP CONSTRAINT "Experiment_userId_fkey";

-- AlterTable
ALTER TABLE "Prediction" DROP COLUMN "bestConcA",
DROP COLUMN "bestConcB",
DROP COLUMN "heatmap",
DROP COLUMN "patientDataUrl",
DROP COLUMN "synergy",
DROP COLUMN "targetA",
DROP COLUMN "targetB",
ADD COLUMN     "concentrationA" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "concentrationB" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "confidenceLevel" "Confidence" NOT NULL,
ADD COLUMN     "synergyScore" DOUBLE PRECISION NOT NULL,
DROP COLUMN "confidence",
ADD COLUMN     "confidence" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "public"."Experiment";

-- CreateTable
CREATE TABLE "DrugCombination" (
    "id" TEXT NOT NULL,
    "drugA" TEXT NOT NULL,
    "drugB" TEXT NOT NULL,
    "cellLine" TEXT NOT NULL,
    "minConcA" DOUBLE PRECISION NOT NULL,
    "maxConcA" DOUBLE PRECISION NOT NULL,
    "minConcB" DOUBLE PRECISION NOT NULL,
    "maxConcB" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrugCombination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DrugCombination_drugA_drugB_idx" ON "DrugCombination"("drugA", "drugB");

-- CreateIndex
CREATE INDEX "DrugCombination_cellLine_idx" ON "DrugCombination"("cellLine");

-- CreateIndex
CREATE UNIQUE INDEX "DrugCombination_drugA_drugB_cellLine_key" ON "DrugCombination"("drugA", "drugB", "cellLine");

-- CreateIndex
CREATE INDEX "Prediction_name_idx" ON "Prediction"("name");
