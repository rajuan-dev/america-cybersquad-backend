-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'AGENT', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('BY_THE_HOUR', 'DAY_TRIP', 'MULTI_DAY_TOUR', 'PRIVATE_TRANSFER', 'AIRPORT_TRANSFER');

-- CreateEnum
CREATE TYPE "RouteType" AS ENUM ('CITY_TO_CITY', 'AIRPORT_TRANSFER', 'MULTI_DAY');

-- CreateEnum
CREATE TYPE "EveryServiceStatus" AS ENUM ('AVAILABLE', 'BOOKED');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'UNPAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "PromoStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SupportType" AS ENUM ('Critical', 'High', 'Medium', 'Low');

-- CreateEnum
CREATE TYPE "SupportStatus" AS ENUM ('Pending', 'Closed');

-- CreateTable
CREATE TABLE "users" (
    "_id" TEXT NOT NULL,
    "fullName" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '123456',
    "profileImage" TEXT NOT NULL DEFAULT 'https://i.ibb.co/Ps9gZ8DD/Profile-image.png',
    "contactNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "country" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "fcmToken" TEXT DEFAULT '',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "stripeAccountId" TEXT,
    "isStripeConnected" BOOLEAN NOT NULL DEFAULT false,
    "supportNotification" BOOLEAN NOT NULL DEFAULT true,
    "paymentNotification" BOOLEAN NOT NULL DEFAULT true,
    "emailNotification" BOOLEAN NOT NULL DEFAULT true,
    "otp" TEXT,
    "otpExpiry" TIMESTAMP(3),
    "identifier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "admins" (
    "_id" TEXT NOT NULL,
    "fullName" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");
