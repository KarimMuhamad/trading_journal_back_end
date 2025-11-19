import { User } from "../../prisma/generated/client";

export type AuthResponse = {
    id: number;
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

export type AuthLoginResponse = {
    authRes: AuthResponse;
    accessToken: string;
    session_id?: number;
    token?: string;
    refreshTokenExpiresIn?: number;
}

export function toAuthResponse(user: User): AuthResponse {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.is_verified
    };
}