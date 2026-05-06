-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('HomeWork', 'Practice', 'Project', 'Quiz');

-- CreateTable
CREATE TABLE "class_assignments" (
    "id" TEXT NOT NULL,
    "assignmentTitle" VARCHAR(255) NOT NULL,
    "assignmentType" "AssignmentType" NOT NULL,
    "assignmentDueDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "attachmentFiles" TEXT[],
    "assessmentAvailable" BOOLEAN NOT NULL DEFAULT false,
    "classDistributionId" VARCHAR(255) NOT NULL,
    "subscriptionId" VARCHAR(255) NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_assignments_classDistributionId_idx" ON "class_assignments"("classDistributionId");

-- CreateIndex
CREATE INDEX "class_assignments_subscriptionId_idx" ON "class_assignments"("subscriptionId");

-- CreateIndex
CREATE INDEX "class_assignments_assignmentType_idx" ON "class_assignments"("assignmentType");

-- CreateIndex
CREATE INDEX "class_assignments_assessmentAvailable_idx" ON "class_assignments"("assessmentAvailable");

-- AddForeignKey
ALTER TABLE "class_assignments" ADD CONSTRAINT "class_assignments_classDistributionId_fkey" FOREIGN KEY ("classDistributionId") REFERENCES "ClassDistribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_assignments" ADD CONSTRAINT "class_assignments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
