/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `microsoftAccessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `microsoftRefreshToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `microsoftTokenExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "microsoftAccessToken",
DROP COLUMN "microsoftRefreshToken",
DROP COLUMN "microsoftTokenExpiry",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "microsoft_access_token" TEXT,
ADD COLUMN     "microsoft_refresh_token" TEXT,
ADD COLUMN     "microsoft_token_expiry" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "password" DROP NOT NULL;
