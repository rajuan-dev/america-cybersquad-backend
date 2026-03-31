-- AlterTable
ALTER TABLE "users" ADD COLUMN     "schoolName" TEXT;

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "owner" BOOLEAN NOT NULL,
    "typeOfOwner" TEXT NOT NULL,
    "branches" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "questions_userId_key" ON "questions"("userId");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
