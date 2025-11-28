/*
  Warnings:

  - The primary key for the `accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `auth_session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `email_verifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `password_resets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `playbooks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `trade_playbooks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `trades` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `status` column on the `trades` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `auth_session` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `auth_session` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `email_verifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `email_verifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `password_resets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `password_resets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `playbooks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `playbooks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `trade_playbooks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `trade_id` on the `trade_playbooks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `playbook_id` on the `trade_playbooks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `trades` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `trades` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `account_id` on the `trades` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `position` on the `trades` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `trade_result` on the `trades` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('Running', 'Closed');

-- CreateEnum
CREATE TYPE "TradeResult" AS ENUM ('Win', 'BE', 'Lose');

-- CreateEnum
CREATE TYPE "PositionType" AS ENUM ('Long', 'Short');

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "auth_session" DROP CONSTRAINT "auth_session_user_id_fkey";

-- DropForeignKey
ALTER TABLE "email_verifications" DROP CONSTRAINT "email_verifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "password_resets" DROP CONSTRAINT "password_resets_user_id_fkey";

-- DropForeignKey
ALTER TABLE "playbooks" DROP CONSTRAINT "playbooks_user_id_fkey";

-- DropForeignKey
ALTER TABLE "trade_playbooks" DROP CONSTRAINT "trade_playbooks_playbook_id_fkey";

-- DropForeignKey
ALTER TABLE "trade_playbooks" DROP CONSTRAINT "trade_playbooks_trade_id_fkey";

-- DropForeignKey
ALTER TABLE "trades" DROP CONSTRAINT "trades_account_id_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_pkey",
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_risk_daily" DECIMAL(65,30) NOT NULL DEFAULT 3.00,
ADD COLUMN     "risk_per_trade" DECIMAL(65,30) NOT NULL DEFAULT 1.00,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth_session" DROP CONSTRAINT "auth_session_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "auth_session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "email_verifications" DROP CONSTRAINT "email_verifications_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "password_resets" DROP CONSTRAINT "password_resets_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "playbooks" DROP CONSTRAINT "playbooks_pkey",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "playbooks_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "trade_playbooks" DROP CONSTRAINT "trade_playbooks_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "trade_id",
ADD COLUMN     "trade_id" UUID NOT NULL,
DROP COLUMN "playbook_id",
ADD COLUMN     "playbook_id" UUID NOT NULL,
ADD CONSTRAINT "trade_playbooks_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "trades" DROP CONSTRAINT "trades_pkey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "account_id",
ADD COLUMN     "account_id" UUID NOT NULL,
DROP COLUMN "position",
ADD COLUMN     "position" "PositionType" NOT NULL,
DROP COLUMN "trade_result",
ADD COLUMN     "trade_result" "TradeResult" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "TradeStatus" NOT NULL DEFAULT 'Running',
ALTER COLUMN "link_img" DROP NOT NULL,
ADD CONSTRAINT "trades_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_expires_at" TIMESTAMP(3),
ADD COLUMN     "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "accounts_user_id_is_archived_idx" ON "accounts"("user_id", "is_archived");

-- CreateIndex
CREATE INDEX "playbooks_user_id_deleted_at_idx" ON "playbooks"("user_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "trade_playbooks_trade_id_playbook_id_key" ON "trade_playbooks"("trade_id", "playbook_id");

-- CreateIndex
CREATE INDEX "trades_account_id_status_idx" ON "trades"("account_id", "status");

-- CreateIndex
CREATE INDEX "users_deleted_at_deleted_expires_at_idx" ON "users"("deleted_at", "deleted_expires_at");

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playbooks" ADD CONSTRAINT "playbooks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_playbooks" ADD CONSTRAINT "trade_playbooks_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_playbooks" ADD CONSTRAINT "trade_playbooks_playbook_id_fkey" FOREIGN KEY ("playbook_id") REFERENCES "playbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
