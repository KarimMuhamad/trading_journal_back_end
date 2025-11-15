import { User } from "@prisma/client";

export type AuthResponse = {
    id: number;
    username: string;
    email: string;
};

export type AuthRequestRegister = {
    username: string;
    email: string;
    password: string;
};

export function toAuthResponse(user: User): AuthResponse {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
    };
}