/*
  Warnings:

  - You are about to alter the column `title` on the `announcements` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `description` on the `announcements` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.
  - Added the required column `subscriptionId` to the `announcements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "subscriptionId" TEXT NOT NULL,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(300);

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
