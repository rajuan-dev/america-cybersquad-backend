-- DropForeignKey
ALTER TABLE "class_distributions" DROP CONSTRAINT "class_distributions_classLevel_fkey";

-- DropForeignKey
ALTER TABLE "class_distributions" DROP CONSTRAINT "class_distributions_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "class_distributions" DROP CONSTRAINT "class_distributions_teacherId_fkey";

-- DropIndex
DROP INDEX "class_distributions_subscriptionId_key";

-- AlterTable
ALTER TABLE "class_distributions" ALTER COLUMN "roomNumber" SET DATA TYPE TEXT,
ALTER COLUMN "teacherId" SET DATA TYPE TEXT,
ALTER COLUMN "classLevel" SET DATA TYPE TEXT,
ALTER COLUMN "subscriptionId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "classDistributionId" TEXT;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_classDistributionId_fkey" FOREIGN KEY ("classDistributionId") REFERENCES "class_distributions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_distributions" ADD CONSTRAINT "class_distributions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_distributions" ADD CONSTRAINT "class_distributions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
