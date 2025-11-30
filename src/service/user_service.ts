import {User} from "../../prisma/generated/client";
import prisma from "../application/database";
import {toUserResponse, UserResponse} from "../model/user_model";

export class UserService {
    static async getUserProfile(user: User) : Promise<UserResponse> {
        const getUser = await prisma.user.findUnique({where: {id: user.id}});

        return toUserResponse(getUser!);
    }
}