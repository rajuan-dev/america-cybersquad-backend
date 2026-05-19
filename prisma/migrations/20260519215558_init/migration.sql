/*
  Warnings:

  - Added the required column `nurseId` to the `health_records` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "health_records" ADD COLUMN     "nurseId" VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "staffs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
