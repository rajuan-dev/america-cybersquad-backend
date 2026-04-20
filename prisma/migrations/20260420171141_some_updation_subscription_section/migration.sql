/*
  Warnings:

  - You are about to drop the column `branchName` on the `subscriptiondetails` table. All the data in the column will be lost.
  - You are about to drop the column `locationContext` on the `subscriptiondetails` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `subscriptiondetails` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `subscriptiondetails` table. All the data in the column will be lost.
  - You are about to drop the column `student` on the `subscriptiondetails` table. All the data in the column will be lost.
  - You are about to alter the column `subscriptionId` on the `subscriptiondetails` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `state` on the `subscriptiondetails` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `city` on the `subscriptiondetails` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `studentLimit` on the `subscriptions` table. All the data in the column will be lost.
  - Added the required column `area` to the `subscriptiondetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `subscriptiondetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolName` to the `subscriptiondetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolType` to the `subscriptiondetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentLimit` to the `subscriptiondetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscriptionType` to the `subscriptiondetails` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('free_trial', 'paid');

-- CreateEnum
CREATE TYPE "SchoolArea" AS ENUM ('Urban', 'Rural');

-- DropForeignKey
ALTER TABLE "subscriptiondetails" DROP CONSTRAINT "subscriptiondetails_subscriptionId_fkey";

-- DropIndex
DROP INDEX "subscriptiondetails_branchName_idx";

-- DropIndex
DROP INDEX "subscriptiondetails_locationContext_idx";

-- DropIndex
DROP INDEX "subscriptiondetails_province_idx";

-- DropIndex
DROP INDEX "subscriptiondetails_region_idx";

-- DropIndex
DROP INDEX "subscriptiondetails_student_idx";

-- AlterTable
ALTER TABLE "subscriptiondetails" DROP COLUMN "branchName",
DROP COLUMN "locationContext",
DROP COLUMN "province",
DROP COLUMN "region",
DROP COLUMN "student",
ADD COLUMN     "area" "SchoolArea" NOT NULL,
ADD COLUMN     "country" VARCHAR(100) NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "schoolName" VARCHAR(100) NOT NULL,
ADD COLUMN     "schoolType" VARCHAR(100) NOT NULL,
ADD COLUMN     "studentLimit" VARCHAR(100) NOT NULL,
ADD COLUMN     "subscriptionType" "SubscriptionType" NOT NULL,
ALTER COLUMN "subscriptionId" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "state" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "city" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "studentLimit",
ALTER COLUMN "price" SET DEFAULT 0.00;

-- CreateIndex
CREATE INDEX "subscriptiondetails_schoolName_idx" ON "subscriptiondetails"("schoolName");

-- CreateIndex
CREATE INDEX "subscriptiondetails_country_idx" ON "subscriptiondetails"("country");

-- CreateIndex
CREATE INDEX "subscriptiondetails_area_idx" ON "subscriptiondetails"("area");

-- CreateIndex
CREATE INDEX "subscriptiondetails_schoolType_idx" ON "subscriptiondetails"("schoolType");

-- CreateIndex
CREATE INDEX "subscriptions_price_idx" ON "subscriptions"("price");

-- AddForeignKey
ALTER TABLE "subscriptiondetails" ADD CONSTRAINT "subscriptiondetails_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
