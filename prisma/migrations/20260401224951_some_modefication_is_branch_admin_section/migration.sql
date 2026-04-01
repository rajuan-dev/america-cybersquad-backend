/*
  Warnings:

  - A unique constraint covering the columns `[assignBranch]` on the table `branchadmins` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "branchadmins_assignBranch_key" ON "branchadmins"("assignBranch");
