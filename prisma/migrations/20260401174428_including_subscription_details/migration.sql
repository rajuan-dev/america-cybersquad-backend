/*
  Warnings:

  - You are about to drop the column `country` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `countryCategory` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `locationType` on the `subscriptions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "subscriptions_countryCategory_idx";

-- DropIndex
DROP INDEX "subscriptions_country_idx";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "country",
DROP COLUMN "countryCategory",
DROP COLUMN "locationType";

-- CreateTable
CREATE TABLE "subscriptiondetails" (
    "id" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "locationContext" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "student" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionsId" TEXT,

    CONSTRAINT "subscriptiondetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subscriptiondetails_branchName_idx" ON "subscriptiondetails"("branchName");

-- CreateIndex
CREATE INDEX "subscriptiondetails_locationContext_idx" ON "subscriptiondetails"("locationContext");

-- CreateIndex
CREATE INDEX "subscriptiondetails_student_idx" ON "subscriptiondetails"("student");

-- CreateIndex
CREATE INDEX "subscriptiondetails_state_idx" ON "subscriptiondetails"("state");

-- CreateIndex
CREATE INDEX "subscriptiondetails_region_idx" ON "subscriptiondetails"("region");

-- CreateIndex
CREATE INDEX "subscriptiondetails_province_idx" ON "subscriptiondetails"("province");

-- CreateIndex
CREATE INDEX "subscriptiondetails_city_idx" ON "subscriptiondetails"("city");

-- AddForeignKey
ALTER TABLE "subscriptiondetails" ADD CONSTRAINT "subscriptiondetails_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptiondetails" ADD CONSTRAINT "subscriptiondetails_subscriptionsId_fkey" FOREIGN KEY ("subscriptionsId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
