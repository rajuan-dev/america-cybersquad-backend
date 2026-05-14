/*
  Warnings:

  - A unique constraint covering the columns `[examAnnouncementId,studentId]` on the table `exam_grades` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "exam_grades_examAnnouncementId_key";

-- CreateIndex
CREATE UNIQUE INDEX "exam_grades_examAnnouncementId_studentId_key" ON "exam_grades"("examAnnouncementId", "studentId");
