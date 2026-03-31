-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryCategory" TEXT NOT NULL,
    "locationType" TEXT NOT NULL,
    "studentLimit" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subscriptions_country_idx" ON "subscriptions"("country");

-- CreateIndex
CREATE INDEX "subscriptions_countryCategory_idx" ON "subscriptions"("countryCategory");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
