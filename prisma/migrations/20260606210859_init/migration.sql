/*
  Warnings:

  - A unique constraint covering the columns `[verificationCode]` on the table `staffs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verificationCode]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "staffs" ADD COLUMN     "verificationCode" INTEGER;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "verificationCode" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "staffs_verificationCode_key" ON "staffs"("verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_verificationCode_key" ON "teachers"("verificationCode");
