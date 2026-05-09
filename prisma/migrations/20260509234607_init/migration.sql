-- AlterTable
ALTER TABLE "supports" ADD COLUMN     "teacherId" TEXT;

-- AddForeignKey
ALTER TABLE "supports" ADD CONSTRAINT "supports_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
