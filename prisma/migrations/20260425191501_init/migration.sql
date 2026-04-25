/*
  Warnings:

  - A unique constraint covering the columns `[subscriptionId]` on the table `class_distributions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subscriptionId` to the `class_distributions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "class_distributions" ADD COLUMN     "subscriptionId" VARCHAR(20) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "class_distributions_subscriptionId_key" ON "class_distributions"("subscriptionId");

-- CreateIndex
CREATE INDEX "class_distributions_subscriptionId_idx" ON "class_distributions"("subscriptionId");

-- AddForeignKey
ALTER TABLE "class_distributions" ADD CONSTRAINT "class_distributions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
