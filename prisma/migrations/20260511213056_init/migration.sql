/*
  Warnings:

  - A unique constraint covering the columns `[studentId,classAssignmentId]` on the table `submit_assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "submit_assignment_studentId_classAssignmentId_key" ON "submit_assignment"("studentId", "classAssignmentId");
