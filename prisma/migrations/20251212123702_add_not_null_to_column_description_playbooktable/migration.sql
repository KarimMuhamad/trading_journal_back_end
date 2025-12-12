-- AlterTable
ALTER TABLE "playbooks" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "description" SET DATA TYPE TEXT;
