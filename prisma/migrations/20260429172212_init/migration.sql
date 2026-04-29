-- CreateTable
CREATE TABLE "student_fees" (
    "id" TEXT NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL,
    "unpaidAmount" DOUBLE PRECISION NOT NULL,
    "studentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feesManagementId" TEXT NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_fees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_fees_paidAmount_idx" ON "student_fees"("paidAmount");

-- CreateIndex
CREATE INDEX "student_fees_unpaidAmount_idx" ON "student_fees"("unpaidAmount");

-- CreateIndex
CREATE INDEX "student_fees_studentId_idx" ON "student_fees"("studentId");

-- CreateIndex
CREATE INDEX "student_fees_feesManagementId_idx" ON "student_fees"("feesManagementId");

-- AddForeignKey
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_feesManagementId_fkey" FOREIGN KEY ("feesManagementId") REFERENCES "fees_managements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
