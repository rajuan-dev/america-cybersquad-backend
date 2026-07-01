-- CreateTable
CREATE TABLE "institution_branches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "subscriptionDetailId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contact" TEXT,
    "annualPriceUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pricingRuleVersion" TEXT,
    "isOverridden" BOOLEAN NOT NULL DEFAULT false,
    "overrideReason" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institution_branches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institution_branches_subscriptionDetailId_key" ON "institution_branches"("subscriptionDetailId");

-- CreateIndex
CREATE INDEX "institution_branches_userId_idx" ON "institution_branches"("userId");

-- CreateIndex
CREATE INDEX "institution_branches_subscriptionId_idx" ON "institution_branches"("subscriptionId");

-- CreateIndex
CREATE INDEX "institution_branches_name_idx" ON "institution_branches"("name");

-- AddForeignKey
ALTER TABLE "institution_branches" ADD CONSTRAINT "institution_branches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_branches" ADD CONSTRAINT "institution_branches_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
