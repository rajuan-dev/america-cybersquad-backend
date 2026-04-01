-- CreateTable
CREATE TABLE "branchadmins" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "joingDinate" TEXT NOT NULL,
    "assignBranch" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branchadmins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "branchadmins_fullName_idx" ON "branchadmins"("fullName");

-- CreateIndex
CREATE INDEX "branchadmins_phoneNumber_idx" ON "branchadmins"("phoneNumber");

-- CreateIndex
CREATE INDEX "branchadmins_emailAddress_idx" ON "branchadmins"("emailAddress");

-- CreateIndex
CREATE INDEX "branchadmins_assignBranch_idx" ON "branchadmins"("assignBranch");

-- AddForeignKey
ALTER TABLE "branchadmins" ADD CONSTRAINT "branchadmins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
