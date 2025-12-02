-- CreateTable
CREATE TABLE "email_change_verification" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "otp" VARCHAR(6) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_change_verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_change_verification_user_id_otp_idx" ON "email_change_verification"("user_id", "otp");

-- AddForeignKey
ALTER TABLE "email_change_verification" ADD CONSTRAINT "email_change_verification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
