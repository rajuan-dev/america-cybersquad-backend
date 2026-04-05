-- AlterTable
ALTER TABLE "branchadmins" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "photo" TEXT;

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "guardianPhone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "verificationCode" INTEGER,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "branchAdminId" TEXT NOT NULL,
    "photo" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_verificationCode_key" ON "students"("verificationCode");

-- CreateIndex
CREATE INDEX "students_name_idx" ON "students"("name");

-- CreateIndex
CREATE INDEX "students_email_idx" ON "students"("email");

-- CreateIndex
CREATE INDEX "students_branchName_idx" ON "students"("branchName");

-- CreateIndex
CREATE INDEX "students_className_idx" ON "students"("className");

-- CreateIndex
CREATE INDEX "students_guardianName_idx" ON "students"("guardianName");

-- CreateIndex
CREATE INDEX "students_guardianPhone_idx" ON "students"("guardianPhone");

-- CreateIndex
CREATE INDEX "students_verificationCode_idx" ON "students"("verificationCode");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_branchAdminId_fkey" FOREIGN KEY ("branchAdminId") REFERENCES "branchadmins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
