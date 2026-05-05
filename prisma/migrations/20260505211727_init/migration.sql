-- CreateTable
CREATE TABLE "class_recordings" (
    "id" TEXT NOT NULL,
    "classDistributionId" VARCHAR(255) NOT NULL,
    "subscriptionId" VARCHAR(255) NOT NULL,
    "recordingUrl" TEXT NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_recordings_classDistributionId_idx" ON "class_recordings"("classDistributionId");

-- CreateIndex
CREATE INDEX "class_recordings_subscriptionId_idx" ON "class_recordings"("subscriptionId");

-- CreateIndex
CREATE INDEX "class_recordings_recordingUrl_idx" ON "class_recordings"("recordingUrl");

-- AddForeignKey
ALTER TABLE "class_recordings" ADD CONSTRAINT "class_recordings_classDistributionId_fkey" FOREIGN KEY ("classDistributionId") REFERENCES "ClassDistribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_recordings" ADD CONSTRAINT "class_recordings_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
