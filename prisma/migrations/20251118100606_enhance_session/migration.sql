/*
  Warnings:

  - Added the required column `browser` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip_address` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `os` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revoked_at` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_agent` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "browser" VARCHAR(50) NOT NULL,
ADD COLUMN     "ip_address" VARCHAR(255) NOT NULL,
ADD COLUMN     "os" VARCHAR(50) NOT NULL,
ADD COLUMN     "revoked_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_agent" VARCHAR(255) NOT NULL;
