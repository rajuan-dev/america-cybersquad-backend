-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "subject" TEXT[],
    "assignClass" TEXT[],
    "password" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "photo" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionId" TEXT NOT NULL,
    "branchAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teachers_email_key" ON "teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_phoneNumber_key" ON "teachers"("phoneNumber");

-- CreateIndex
CREATE INDEX "teachers_teacherName_idx" ON "teachers"("teacherName");

-- CreateIndex
CREATE INDEX "teachers_email_idx" ON "teachers"("email");

-- CreateIndex
CREATE INDEX "teachers_phoneNumber_idx" ON "teachers"("phoneNumber");

-- CreateIndex
CREATE INDEX "teachers_branchName_idx" ON "teachers"("branchName");

-- CreateIndex
CREATE INDEX "teachers_subject_idx" ON "teachers"("subject");

-- CreateIndex
CREATE INDEX "teachers_assignClass_idx" ON "teachers"("assignClass");

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_branchAdminId_fkey" FOREIGN KEY ("branchAdminId") REFERENCES "branchadmins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
