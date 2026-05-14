-- CreateTable
CREATE TABLE "exam_announcements" (
    "id" TEXT NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "tipTapEditor" TEXT NOT NULL,
    "subscriptionId" VARCHAR(255) NOT NULL,
    "classDistributionId" VARCHAR(255) NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_announcements_subscriptionId_idx" ON "exam_announcements"("subscriptionId");

-- CreateIndex
CREATE INDEX "exam_announcements_classDistributionId_idx" ON "exam_announcements"("classDistributionId");

-- CreateIndex
CREATE INDEX "exam_announcements_examDate_idx" ON "exam_announcements"("examDate");

-- AddForeignKey
ALTER TABLE "exam_announcements" ADD CONSTRAINT "exam_announcements_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_announcements" ADD CONSTRAINT "exam_announcements_classDistributionId_fkey" FOREIGN KEY ("classDistributionId") REFERENCES "ClassDistribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
