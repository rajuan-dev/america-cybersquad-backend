-- AlterTable
ALTER TABLE "supports" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "supports" ADD CONSTRAINT "supports_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
