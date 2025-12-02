export interface EmailOptions {
    to: string | string[];
    subject: string;
    template: string;
    context: Record<string, any>;
}

export enum EmailTemplate {
    RESET_PASSWORD = "reset_password",
    EMAIL_VERIFICATION = "email_verification",
    PASSWORD_CHANGED = "password_changed",
    DELETE_ACCOUNT = "delete_account"
}

export interface EmailUser {
    email: string;
    name: string;
}

export interface ResetPasswordData {
    email: string;
    username: string;
    resetToken: string;
    expiryTIme: string;
}

export interface EmailVerificationData {
    email: string;
    username: string;
    verificationToken: string;
    expiryTime: string;
}

export interface PasswordChangedData {
    email: string;
    username: string;
    changedAt: string;
    deviceInfo: string;
}

export interface DeleteAccountData {
    email: string;
    username: string;
    deleteDate: string;
}

export interface EmailChangeData {
    email: string;
    username: string;
    otp: string;
    expiryTime: string;
}