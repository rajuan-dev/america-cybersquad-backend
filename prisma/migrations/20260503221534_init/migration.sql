/*
  Warnings:

  - A unique constraint covering the columns `[studentId,AttendanceDate,teacherId]` on the table `attendance_sheets` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "attendance_sheets_attendanceStatus_idx";

-- DropIndex
DROP INDEX "attendance_sheets_subscriptionId_idx";

-- CreateIndex
CREATE INDEX "attendance_sheets_AttendanceDate_idx" ON "attendance_sheets"("AttendanceDate");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_sheets_studentId_AttendanceDate_teacherId_key" ON "attendance_sheets"("studentId", "AttendanceDate", "teacherId");
