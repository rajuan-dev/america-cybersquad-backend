/*
  Warnings:

  - You are about to drop the column `subscriptionsId` on the `subscriptiondetails` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "subscriptiondetails" DROP CONSTRAINT "subscriptiondetails_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptiondetails" DROP CONSTRAINT "subscriptiondetails_subscriptionsId_fkey";

-- AlterTable
ALTER TABLE "subscriptiondetails" DROP COLUMN "subscriptionsId";

-- AddForeignKey
ALTER TABLE "subscriptiondetails" ADD CONSTRAINT "subscriptiondetails_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
