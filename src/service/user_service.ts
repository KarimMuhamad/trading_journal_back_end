import {User} from "../../prisma/generated/client";
import prisma from "../application/database";
import {toUserResponse, UserResponse} from "../model/user_model";
import {ErrorResponse} from "../error/error_response";

export class UserService {
    static async getUserProfile(user: User) : Promise<UserResponse> {
        const getUser = await prisma.user.findUnique({where: {id: user.id}});
        if (!getUser) throw new ErrorResponse(404, "User not found");

        return toUserResponse(getUser!);
    }
}