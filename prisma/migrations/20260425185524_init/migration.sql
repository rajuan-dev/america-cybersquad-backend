-- CreateTable
CREATE TABLE "class_distributions" (
    "id" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "roomNumber" VARCHAR(20) NOT NULL,
    "teacherId" VARCHAR(100) NOT NULL,
    "classLevel" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "class_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_distributions_teacherId_idx" ON "class_distributions"("teacherId");

-- CreateIndex
CREATE INDEX "class_distributions_classLevel_idx" ON "class_distributions"("classLevel");

-- CreateIndex
CREATE INDEX "class_distributions_capacity_idx" ON "class_distributions"("capacity");

-- AddForeignKey
ALTER TABLE "class_distributions" ADD CONSTRAINT "class_distributions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_distributions" ADD CONSTRAINT "class_distributions_classLevel_fkey" FOREIGN KEY ("classLevel") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
