/*
  Warnings:

  - You are about to drop the column `joingDinate` on the `branchadmins` table. All the data in the column will be lost.
  - Added the required column `joinDate` to the `branchadmins` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "branchadmins" DROP COLUMN "joingDinate",
ADD COLUMN     "joinDate" TEXT NOT NULL;
