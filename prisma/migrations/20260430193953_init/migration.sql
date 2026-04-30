/*
  Warnings:

  - You are about to drop the column `feesStatus` on the `student_fees` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,feesManagementId]` on the table `student_fees` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ONLINE', 'MANUAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PARTIAL', 'UNPAID');

-- DropIndex
DROP INDEX "fees_managements_totalFees_idx";

-- DropIndex
DROP INDEX "student_fees_paidAmount_idx";

-- DropIndex
DROP INDEX "student_fees_unpaidAmount_idx";

-- AlterTable
ALTER TABLE "student_fees" DROP COLUMN "feesStatus",
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ALTER COLUMN "paidAmount" SET DEFAULT 0;

-- DropEnum
DROP TYPE "FessStatus";

-- CreateTable
CREATE TABLE "paymentHistory" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "studentFeesId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "paymentHistory_amount_idx" ON "paymentHistory"("amount");

-- CreateIndex
CREATE INDEX "paymentHistory_studentFeesId_idx" ON "paymentHistory"("studentFeesId");

-- CreateIndex
CREATE UNIQUE INDEX "student_fees_studentId_feesManagementId_key" ON "student_fees"("studentId", "feesManagementId");

-- AddForeignKey
ALTER TABLE "paymentHistory" ADD CONSTRAINT "paymentHistory_studentFeesId_fkey" FOREIGN KEY ("studentFeesId") REFERENCES "student_fees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
