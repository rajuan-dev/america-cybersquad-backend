-- CreateTable
CREATE TABLE "submit_assignment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classAssignmentId" TEXT NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submit_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submit_assignment_files" (
    "id" TEXT NOT NULL,
    "submitAssignmentId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submit_assignment_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "submit_assignment_studentId_idx" ON "submit_assignment"("studentId");

-- CreateIndex
CREATE INDEX "submit_assignment_classAssignmentId_idx" ON "submit_assignment"("classAssignmentId");

-- CreateIndex
CREATE INDEX "submit_assignment_files_submitAssignmentId_idx" ON "submit_assignment_files"("submitAssignmentId");

-- AddForeignKey
ALTER TABLE "submit_assignment" ADD CONSTRAINT "submit_assignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submit_assignment" ADD CONSTRAINT "submit_assignment_classAssignmentId_fkey" FOREIGN KEY ("classAssignmentId") REFERENCES "class_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submit_assignment_files" ADD CONSTRAINT "submit_assignment_files_submitAssignmentId_fkey" FOREIGN KEY ("submitAssignmentId") REFERENCES "submit_assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
