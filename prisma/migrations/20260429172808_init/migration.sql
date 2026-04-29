-- CreateEnum
CREATE TYPE "FessStatus" AS ENUM ('online', 'manual');

-- AlterTable
ALTER TABLE "student_fees" ADD COLUMN     "feesStatus" "FessStatus" NOT NULL DEFAULT 'manual';
