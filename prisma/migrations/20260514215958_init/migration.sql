-- DropIndex
DROP INDEX "exam_announcements_examDate_idx";

-- CreateTable
CREATE TABLE "exam_grades" (
    "id" TEXT NOT NULL,
    "examAnnouncementId" VARCHAR(255) NOT NULL,
    "studentId" VARCHAR(255) NOT NULL,
    "teacherId" TEXT NOT NULL,
    "totalMarks" DOUBLE PRECISION NOT NULL,
    "marks" DOUBLE PRECISION NOT NULL,
    "instructions" VARCHAR(555),
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_grades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_grades_examAnnouncementId_key" ON "exam_grades"("examAnnouncementId");

-- CreateIndex
CREATE INDEX "exam_grades_studentId_idx" ON "exam_grades"("studentId");

-- CreateIndex
CREATE INDEX "exam_grades_teacherId_idx" ON "exam_grades"("teacherId");

-- CreateIndex
CREATE INDEX "exam_grades_examAnnouncementId_idx" ON "exam_grades"("examAnnouncementId");

-- AddForeignKey
ALTER TABLE "exam_grades" ADD CONSTRAINT "exam_grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_grades" ADD CONSTRAINT "exam_grades_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_grades" ADD CONSTRAINT "exam_grades_examAnnouncementId_fkey" FOREIGN KEY ("examAnnouncementId") REFERENCES "exam_announcements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
