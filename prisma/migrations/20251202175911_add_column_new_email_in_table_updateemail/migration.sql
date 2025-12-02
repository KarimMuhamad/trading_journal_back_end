/*
  Warnings:

  - Added the required column `new_email` to the `email_change_verification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email_change_verification" ADD COLUMN     "new_email" VARCHAR(100) NOT NULL;
