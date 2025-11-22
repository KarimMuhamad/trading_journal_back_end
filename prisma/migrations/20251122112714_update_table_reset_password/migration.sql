/*
  Warnings:

  - You are about to drop the column `otp_hash` on the `password_resets` table. All the data in the column will be lost.
  - You are about to drop the column `used_at` on the `password_resets` table. All the data in the column will be lost.
  - Added the required column `token` to the `password_resets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email_verifications" ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "password_resets" DROP COLUMN "otp_hash",
DROP COLUMN "used_at",
ADD COLUMN     "token" VARCHAR(255) NOT NULL,
ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false;
