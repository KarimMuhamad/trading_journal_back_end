import { User } from "../../prisma/generated/client";

export type AuthResponse = {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
};

export type AuthRequestRegister = {
    username: string;
    email: string;
    password: string;
};

export type AuthRequestLogin = {
    identifier: string;
    password: string;
}

export type AuthLoginSuccess = {
    authRes: AuthResponse;
    accessToken: string;
    session_id?: string;
    token?: string;
    refreshTokenExpiresIn?: number;
};

export type AuthLoginNeedRecover = {
    status: "RECOVERY_NEEDED";
    message: string;
    token: string;
    recovery_period: number;
};

export type AuthLoginResponse = AuthLoginSuccess | AuthLoginNeedRecover;

export type AuthChangePasswordRequest = {
    newPassword: string;
    currentPassword: string;
};

export type AuthForgotPasswordRequest = {
    email?: string;
    token?: string;
    newPassword?: string;
};

export function toAuthResponse(user: User): AuthResponse {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.is_verified
    };
};