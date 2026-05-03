/*
  Warnings:

  - A unique constraint covering the columns `[sId]` on the table `staffs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "staffs" ADD COLUMN     "sId" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "staffs_sId_key" ON "staffs"("sId");

-- AddForeignKey
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_sId_fkey" FOREIGN KEY ("sId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
