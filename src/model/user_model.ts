import {User} from "../../prisma/generated/client";

export type UserResponse = {
  id: string;
  username: string;
  email: string;
};

export function toUserResponse (user: User): UserResponse {
    return {
        id: user.id,
        username: user.username,
        email: user.email
    };
}