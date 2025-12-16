/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `playbooks` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "playbooks_user_id_deleted_at_idx";

-- AlterTable
ALTER TABLE "playbooks" DROP COLUMN "deleted_at";

-- CreateIndex
CREATE INDEX "playbooks_user_id_idx" ON "playbooks"("user_id");
