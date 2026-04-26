/*
  Warnings:

  - You are about to drop the column `teacherId` on the `class_distributions` table. All the data in the column will be lost.
  - You are about to drop the column `classDistributionId` on the `students` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "class_distributions" DROP CONSTRAINT "class_distributions_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_classDistributionId_fkey";

-- DropIndex
DROP INDEX "class_distributions_teacherId_idx";

-- DropIndex
DROP INDEX "subscriptions_price_idx";

-- DropIndex
DROP INDEX "teachers_assignClass_idx";

-- DropIndex
DROP INDEX "teachers_branchName_idx";

-- DropIndex
DROP INDEX "teachers_email_idx";

-- DropIndex
DROP INDEX "teachers_phoneNumber_idx";

-- DropIndex
DROP INDEX "teachers_role_idx";

-- DropIndex
DROP INDEX "teachers_subject_idx";

-- DropIndex
DROP INDEX "teachers_teacherId_idx";

-- DropIndex
DROP INDEX "teachers_teacherName_idx";

-- AlterTable
ALTER TABLE "class_distributions" DROP COLUMN "teacherId";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "classDistributionId";

-- CreateTable
CREATE TABLE "_ClassDistributionToTeacher" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClassDistributionToTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ClassDistributionToStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClassDistributionToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ClassDistributionToTeacher_B_index" ON "_ClassDistributionToTeacher"("B");

-- CreateIndex
CREATE INDEX "_ClassDistributionToStudent_B_index" ON "_ClassDistributionToStudent"("B");

-- AddForeignKey
ALTER TABLE "_ClassDistributionToTeacher" ADD CONSTRAINT "_ClassDistributionToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "class_distributions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassDistributionToTeacher" ADD CONSTRAINT "_ClassDistributionToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassDistributionToStudent" ADD CONSTRAINT "_ClassDistributionToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "class_distributions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassDistributionToStudent" ADD CONSTRAINT "_ClassDistributionToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
