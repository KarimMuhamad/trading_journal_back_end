import {User} from "../../prisma/generated/client";

export type UserResponse = {
  id: string;
  username: string;
  email: string;
};

export type UserUpdateEmailRequest = {
    email?: string;
    otp?: string;
}

export type UserUpdateUsernameRequest = {
    username: string;
}

export type DeleteAccountRequest = {
    password: string;
};

export function toUserResponse (user: User): UserResponse {
    return {
        id: user.id,
        username: user.username,
        email: user.email
    };
}