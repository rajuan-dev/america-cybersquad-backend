-- CreateTable
CREATE TABLE "online_classes" (
    "id" TEXT NOT NULL,
    "classDistributionId" VARCHAR(255) NOT NULL,
    "subscriptionId" VARCHAR(255) NOT NULL,
    "link" VARCHAR(255) NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "online_classes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "online_classes_classDistributionId_idx" ON "online_classes"("classDistributionId");

-- CreateIndex
CREATE INDEX "online_classes_subscriptionId_idx" ON "online_classes"("subscriptionId");

-- CreateIndex
CREATE INDEX "online_classes_link_idx" ON "online_classes"("link");

-- AddForeignKey
ALTER TABLE "online_classes" ADD CONSTRAINT "online_classes_classDistributionId_fkey" FOREIGN KEY ("classDistributionId") REFERENCES "ClassDistribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_classes" ADD CONSTRAINT "online_classes_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
