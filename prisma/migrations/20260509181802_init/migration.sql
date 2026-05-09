-- CreateEnum
CREATE TYPE "ClassMaterialType" AS ENUM ('pdf', 'word', 'video', 'external_link');

-- CreateTable
CREATE TABLE "class_materials" (
    "id" TEXT NOT NULL,
    "materialType" "ClassMaterialType" NOT NULL,
    "description" TEXT,
    "materialFiles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "external_link" TEXT,
    "classDistributionId" VARCHAR(255) NOT NULL,
    "subscriptionId" VARCHAR(255) NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_materials_materialType_idx" ON "class_materials"("materialType");

-- CreateIndex
CREATE INDEX "class_materials_classDistributionId_idx" ON "class_materials"("classDistributionId");

-- CreateIndex
CREATE INDEX "class_materials_subscriptionId_idx" ON "class_materials"("subscriptionId");

-- AddForeignKey
ALTER TABLE "class_materials" ADD CONSTRAINT "class_materials_classDistributionId_fkey" FOREIGN KEY ("classDistributionId") REFERENCES "ClassDistribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_materials" ADD CONSTRAINT "class_materials_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
