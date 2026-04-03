-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'PARENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN', 'INSTITUTIONAL_OWNER', 'BRANCH_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "photo" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "region" TEXT,
    "province" TEXT,
    "schoolName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "verificationCode" INTEGER,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "fcm" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "designation" VARCHAR(100) NOT NULL,
    "workingPlace" VARCHAR(150) NOT NULL,
    "videoUrl" VARCHAR(255),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "studentLimit" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptiondetails" (
    "id" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "locationContext" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "student" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptiondetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branchadmins" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joinDate" TIMESTAMP(3) NOT NULL,
    "assignBranch" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branchadmins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "fullName" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_verificationCode_key" ON "users"("verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "questions_userId_key" ON "questions"("userId");

-- CreateIndex
CREATE INDEX "contacts_name_idx" ON "contacts"("name");

-- CreateIndex
CREATE INDEX "contacts_email_idx" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "contacts_phoneNumber_idx" ON "contacts"("phoneNumber");

-- CreateIndex
CREATE INDEX "testimonials_name_idx" ON "testimonials"("name");

-- CreateIndex
CREATE INDEX "testimonials_designation_idx" ON "testimonials"("designation");

-- CreateIndex
CREATE INDEX "subscriptiondetails_branchName_idx" ON "subscriptiondetails"("branchName");

-- CreateIndex
CREATE INDEX "subscriptiondetails_locationContext_idx" ON "subscriptiondetails"("locationContext");

-- CreateIndex
CREATE INDEX "subscriptiondetails_student_idx" ON "subscriptiondetails"("student");

-- CreateIndex
CREATE INDEX "subscriptiondetails_state_idx" ON "subscriptiondetails"("state");

-- CreateIndex
CREATE INDEX "subscriptiondetails_region_idx" ON "subscriptiondetails"("region");

-- CreateIndex
CREATE INDEX "subscriptiondetails_province_idx" ON "subscriptiondetails"("province");

-- CreateIndex
CREATE INDEX "subscriptiondetails_city_idx" ON "subscriptiondetails"("city");

-- CreateIndex
CREATE UNIQUE INDEX "branchadmins_phoneNumber_key" ON "branchadmins"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "branchadmins_emailAddress_key" ON "branchadmins"("emailAddress");

-- CreateIndex
CREATE UNIQUE INDEX "branchadmins_assignBranch_key" ON "branchadmins"("assignBranch");

-- CreateIndex
CREATE INDEX "branchadmins_fullName_idx" ON "branchadmins"("fullName");

-- CreateIndex
CREATE INDEX "branchadmins_phoneNumber_idx" ON "branchadmins"("phoneNumber");

-- CreateIndex
CREATE INDEX "branchadmins_role_idx" ON "branchadmins"("role");

-- CreateIndex
CREATE INDEX "branchadmins_emailAddress_idx" ON "branchadmins"("emailAddress");

-- CreateIndex
CREATE INDEX "branchadmins_assignBranch_idx" ON "branchadmins"("assignBranch");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptiondetails" ADD CONSTRAINT "subscriptiondetails_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branchadmins" ADD CONSTRAINT "branchadmins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
