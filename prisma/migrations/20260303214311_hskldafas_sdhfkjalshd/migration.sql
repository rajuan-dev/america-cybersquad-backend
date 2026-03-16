/*
  Warnings:

  - The values [USER,AGENT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `admins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `admins` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailNotification` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `fcmToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `identifier` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isPhoneVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isStripeConnected` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpiry` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `paymentNotification` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripeAccountId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `supportNotification` on the `users` table. All the data in the column will be lost.
  - The required column `id` was added to the `admins` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `city` to the `users` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `country` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('STUDENT', 'PARENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
COMMIT;

-- AlterTable
ALTER TABLE "admins" DROP CONSTRAINT "admins_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "_id",
DROP COLUMN "address",
DROP COLUMN "contactNumber",
DROP COLUMN "dateOfBirth",
DROP COLUMN "emailNotification",
DROP COLUMN "fcmToken",
DROP COLUMN "fullName",
DROP COLUMN "identifier",
DROP COLUMN "isEmailVerified",
DROP COLUMN "isPhoneVerified",
DROP COLUMN "isStripeConnected",
DROP COLUMN "otp",
DROP COLUMN "otpExpiry",
DROP COLUMN "paymentNotification",
DROP COLUMN "profileImage",
DROP COLUMN "stripeAccountId",
DROP COLUMN "supportNotification",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "fcm" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "photo" TEXT,
ALTER COLUMN "password" DROP DEFAULT,
ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'STUDENT',
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropEnum
DROP TYPE "BookingStatus";

-- DropEnum
DROP TYPE "EveryServiceStatus";

-- DropEnum
DROP TYPE "PaymentProvider";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "PromoStatus";

-- DropEnum
DROP TYPE "RouteType";

-- DropEnum
DROP TYPE "ServiceStatus";

-- DropEnum
DROP TYPE "ServiceType";

-- DropEnum
DROP TYPE "SupportStatus";

-- DropEnum
DROP TYPE "SupportType";
