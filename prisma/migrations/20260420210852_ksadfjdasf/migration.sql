/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `announcements` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "announcements" DROP COLUMN "isDeleted",
ADD COLUMN     "isDelete" BOOLEAN NOT NULL DEFAULT false;
