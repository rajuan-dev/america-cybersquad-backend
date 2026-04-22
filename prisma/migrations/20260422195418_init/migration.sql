-- DropIndex
DROP INDEX "students_studentId_key";

-- DropIndex
DROP INDEX "teachers_teacherId_key";

-- CreateIndex
CREATE INDEX "students_studentId_idx" ON "students"("studentId");

-- CreateIndex
CREATE INDEX "teachers_teacherId_idx" ON "teachers"("teacherId");
