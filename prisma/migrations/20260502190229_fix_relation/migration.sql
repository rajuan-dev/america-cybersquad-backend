-- AlterTable
ALTER TABLE "branchadmins" ADD COLUMN     "subscriptionId" TEXT;

-- CreateIndex
CREATE INDEX "branchadmins_subscriptionId_idx" ON "branchadmins"("subscriptionId");

-- AddForeignKey
ALTER TABLE "branchadmins" ADD CONSTRAINT "branchadmins_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
