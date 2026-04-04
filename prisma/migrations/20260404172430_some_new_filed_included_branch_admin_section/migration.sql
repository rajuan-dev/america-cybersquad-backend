/*
  Warnings:

  - A unique constraint covering the columns `[verificationCode]` on the table `branchadmins` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "branchadmins" ADD COLUMN     "verificationCode" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "branchadmins_verificationCode_key" ON "branchadmins"("verificationCode");

-- CreateIndex
CREATE INDEX "branchadmins_verificationCode_idx" ON "branchadmins"("verificationCode");
