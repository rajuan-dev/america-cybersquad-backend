/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `branchadmins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailAddress]` on the table `branchadmins` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `joinDate` on the `branchadmins` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "branchadmins" DROP COLUMN "joinDate",
ADD COLUMN     "joinDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "branchadmins_phoneNumber_key" ON "branchadmins"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "branchadmins_emailAddress_key" ON "branchadmins"("emailAddress");
