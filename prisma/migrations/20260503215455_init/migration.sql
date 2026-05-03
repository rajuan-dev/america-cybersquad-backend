-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');

-- CreateTable
CREATE TABLE "attendance_sheets" (
    "id" TEXT NOT NULL,
    "AttendanceDate" TIMESTAMP(3) NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attendanceStatus" "AttendanceStatus" NOT NULL DEFAULT 'ABSENT',
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_sheets_teacherId_idx" ON "attendance_sheets"("teacherId");

-- CreateIndex
CREATE INDEX "attendance_sheets_studentId_idx" ON "attendance_sheets"("studentId");

-- CreateIndex
CREATE INDEX "attendance_sheets_subscriptionId_idx" ON "attendance_sheets"("subscriptionId");

-- CreateIndex
CREATE INDEX "attendance_sheets_attendanceStatus_idx" ON "attendance_sheets"("attendanceStatus");

-- AddForeignKey
ALTER TABLE "attendance_sheets" ADD CONSTRAINT "attendance_sheets_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sheets" ADD CONSTRAINT "attendance_sheets_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sheets" ADD CONSTRAINT "attendance_sheets_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
