-- CreateTable
CREATE TABLE "vision" (
    "id" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vision_pkey" PRIMARY KEY ("id")
);
