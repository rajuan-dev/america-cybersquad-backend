/*
  Warnings:

  - Added the required column `studentId` to the `staffs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "staffs" ADD COLUMN     "studentId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "staffs_studentId_idx" ON "staffs"("studentId");
