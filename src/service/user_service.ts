import {User} from "../../prisma/generated/client";
import prisma from "../application/database";
import {toUserResponse, UserResponse, UserUpdateUsernameRequest} from "../model/user_model";
import {ErrorResponse} from "../error/error_response";
import {Validation} from "../validation/validation";
import {UserValidation} from "../validation/user_validation";

export class UserService {
    static async getUserProfile(user: User) : Promise<UserResponse> {
        const getUser = await prisma.user.findUnique({where: {id: user.id}});
        if (!getUser) throw new ErrorResponse(404, "User not found");

        return toUserResponse(getUser!);
    }

    static async updateUserName(user: User, req: UserUpdateUsernameRequest) : Promise<UserResponse> {
        const validateReq = Validation.validate(UserValidation.UPDATEUSERNAME, req);

        if (validateReq.username) {
            const isUsernameExist = await prisma.user.findUnique({where: {username: validateReq.username}});
            if (isUsernameExist) throw new ErrorResponse(409, "Username already exist");
        }

        if (user.username === validateReq.username) throw new ErrorResponse(403, "Username cannot be the same");

        const updateUser = await prisma.user.update({where: {id: user.id}, data: {username: validateReq.username}});
        return toUserResponse(updateUser!);
    }
}