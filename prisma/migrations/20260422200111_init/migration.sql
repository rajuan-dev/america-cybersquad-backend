/*
  Warnings:

  - Added the required column `role` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "students" ADD COLUMN     "role" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "role" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "students_role_idx" ON "students"("role");

-- CreateIndex
CREATE INDEX "teachers_role_idx" ON "teachers"("role");
