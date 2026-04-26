/*
  Warnings:

  - You are about to drop the `_ClassDistributionToTeacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `class_distributions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ClassDistributionToStudent" DROP CONSTRAINT "_ClassDistributionToStudent_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClassDistributionToTeacher" DROP CONSTRAINT "_ClassDistributionToTeacher_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClassDistributionToTeacher" DROP CONSTRAINT "_ClassDistributionToTeacher_B_fkey";

-- DropForeignKey
ALTER TABLE "class_distributions" DROP CONSTRAINT "class_distributions_subscriptionId_fkey";

-- DropTable
DROP TABLE "_ClassDistributionToTeacher";

-- DropTable
DROP TABLE "class_distributions";

-- CreateTable
CREATE TABLE "ClassDistribution" (
    "id" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "classLevel" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ClassDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassDistribution_teacherId_idx" ON "ClassDistribution"("teacherId");

-- CreateIndex
CREATE INDEX "ClassDistribution_classLevel_idx" ON "ClassDistribution"("classLevel");

-- CreateIndex
CREATE INDEX "ClassDistribution_subscriptionId_idx" ON "ClassDistribution"("subscriptionId");

-- AddForeignKey
ALTER TABLE "ClassDistribution" ADD CONSTRAINT "ClassDistribution_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassDistribution" ADD CONSTRAINT "ClassDistribution_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassDistributionToStudent" ADD CONSTRAINT "_ClassDistributionToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "ClassDistribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
