-- CreateTable
CREATE TABLE "fees_managements" (
    "id" TEXT NOT NULL,
    "totalFees" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "classLevel" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fees_managements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fees_managements_subscriptionId_key" ON "fees_managements"("subscriptionId");

-- CreateIndex
CREATE INDEX "fees_managements_totalFees_idx" ON "fees_managements"("totalFees");

-- CreateIndex
CREATE INDEX "fees_managements_classLevel_idx" ON "fees_managements"("classLevel");

-- CreateIndex
CREATE INDEX "fees_managements_subscriptionId_idx" ON "fees_managements"("subscriptionId");

-- AddForeignKey
ALTER TABLE "fees_managements" ADD CONSTRAINT "fees_managements_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
