-- AlterTable
ALTER TABLE "supports" ADD COLUMN     "studentId" TEXT;

-- AddForeignKey
ALTER TABLE "supports" ADD CONSTRAINT "supports_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
