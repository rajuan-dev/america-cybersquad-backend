-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "subjectName" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "department" VARCHAR(100) NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "branchAdminId" TEXT NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subjects_subjectName_idx" ON "subjects"("subjectName");

-- CreateIndex
CREATE INDEX "subjects_code_idx" ON "subjects"("code");

-- CreateIndex
CREATE INDEX "subjects_department_idx" ON "subjects"("department");

-- CreateIndex
CREATE INDEX "subjects_subscriptionId_idx" ON "subjects"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_branchAdminId_key" ON "subjects"("branchAdminId");

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_branchAdminId_fkey" FOREIGN KEY ("branchAdminId") REFERENCES "branchadmins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
