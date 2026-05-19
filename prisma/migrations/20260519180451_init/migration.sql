-- CreateEnum
CREATE TYPE "bloodTypeEnum" AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- CreateTable
CREATE TABLE "health_records" (
    "id" TEXT NOT NULL,
    "studentId" VARCHAR(255) NOT NULL,
    "subscriptionId" VARCHAR(255) NOT NULL,
    "bloodType" "bloodTypeEnum" NOT NULL,
    "tipTapEditor" TEXT NOT NULL,
    "emergencyContact" TEXT NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "health_records_studentId_idx" ON "health_records"("studentId");

-- CreateIndex
CREATE INDEX "health_records_subscriptionId_idx" ON "health_records"("subscriptionId");

-- CreateIndex
CREATE INDEX "health_records_bloodType_idx" ON "health_records"("bloodType");

-- CreateIndex
CREATE INDEX "health_records_emergencyContact_idx" ON "health_records"("emergencyContact");

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
