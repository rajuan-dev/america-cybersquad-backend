/*
  Warnings:

  - Added the required column `photo` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "photo" TEXT NOT NULL;
