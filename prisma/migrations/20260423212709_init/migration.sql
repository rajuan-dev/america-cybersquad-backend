-- DropIndex
DROP INDEX "subjects_branchAdminId_key";

-- CreateIndex
CREATE INDEX "subjects_branchAdminId_idx" ON "subjects"("branchAdminId");
