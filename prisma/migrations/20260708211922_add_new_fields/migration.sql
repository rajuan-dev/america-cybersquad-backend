/*
  Warnings:

  - You are about to drop the column `tipTapEditor` on the `exam_announcements` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "exam_announcements" DROP COLUMN "tipTapEditor",
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "examName" TEXT,
ADD COLUMN     "instruction" TEXT,
ADD COLUMN     "topic" TEXT,
ADD COLUMN     "totalMarks" TEXT;
