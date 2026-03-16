/*
  Warnings:

  - You are about to alter the column `verificationCode` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - A unique constraint covering the columns `[verificationCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "verificationCode" DROP DEFAULT,
ALTER COLUMN "verificationCode" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "users_verificationCode_key" ON "users"("verificationCode");
