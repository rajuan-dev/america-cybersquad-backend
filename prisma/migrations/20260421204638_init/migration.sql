-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "supportId" TEXT;

-- CreateTable
CREATE TABLE "supports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "branchAdminId" TEXT,
    "userId" TEXT,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "supports_name_idx" ON "supports"("name");

-- CreateIndex
CREATE INDEX "supports_email_idx" ON "supports"("email");

-- CreateIndex
CREATE INDEX "supports_subscriptionId_idx" ON "supports"("subscriptionId");

-- CreateIndex
CREATE INDEX "supports_branchAdminId_idx" ON "supports"("branchAdminId");

-- CreateIndex
CREATE INDEX "supports_userId_idx" ON "supports"("userId");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_supportId_fkey" FOREIGN KEY ("supportId") REFERENCES "supports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supports" ADD CONSTRAINT "supports_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supports" ADD CONSTRAINT "supports_branchAdminId_fkey" FOREIGN KEY ("branchAdminId") REFERENCES "branchadmins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supports" ADD CONSTRAINT "supports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
