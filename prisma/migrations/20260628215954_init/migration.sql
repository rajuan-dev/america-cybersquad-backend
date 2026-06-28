/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `newsletters` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "newsletters_email_key" ON "newsletters"("email");
