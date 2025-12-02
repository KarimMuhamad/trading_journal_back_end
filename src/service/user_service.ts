import {User} from "../../prisma/generated/client";
import prisma from "../application/database";
import {
    DeleteAccountRequest,
    toUserResponse,
    UserResponse,
    UserUpdateEmailRequest,
    UserUpdateUsernameRequest
} from "../model/user_model";
import {ErrorResponse} from "../error/error_response";
import {Validation} from "../validation/validation";
import {UserValidation} from "../validation/user_validation";
import argon2 from "argon2";
import email_service from "../email/services/email_service";
import {AuthValidation} from "../validation/auth_validation";
import {generateRandomOTP} from "../utils/generateRandomOTP";

export class UserService {
    static async getUserProfile(user: User) : Promise<UserResponse> {
        const getUser = await prisma.user.findUnique({where: {id: user.id}});
        if (!getUser) throw new ErrorResponse(404, "User not found");

        return toUserResponse(getUser!);
    }

    static async updateUserName(user: User, req: UserUpdateUsernameRequest) : Promise<UserResponse> {
        const validateReq = Validation.validate(UserValidation.UPDATEUSERNAME, req);

        if (user.username === validateReq.username) throw new ErrorResponse(403, "Username cannot be the same");

        if (validateReq.username) {
            const isUsernameExist = await prisma.user.findUnique({where: {username: validateReq.username}});
            if (isUsernameExist) throw new ErrorResponse(409, "Username already exist");
        }

        const updateUser = await prisma.user.update({where: {id: user.id}, data: {username: validateReq.username}});
        return toUserResponse(updateUser!);
    }

    static async sendOtpUpdateEmail(user: User, req: UserUpdateEmailRequest) : Promise<void> {
        const validateReq = Validation.validate(UserValidation.UPDATEUSEREMAIL, req);
        if (user.email === validateReq.email) throw new ErrorResponse(403, "Email cannot be the same");

        const isEmailExist = await prisma.user.findUnique({where: {email: validateReq.email}});
        if (isEmailExist) throw new ErrorResponse(409, "Email already exist");

        const OTP = generateRandomOTP();
        const expiryTime = new Date(Date.now() + 1000 * 60 * 6);

        await prisma.emailChangeVerification.create({
            data: {
                user_id: user.id,
                otp: OTP,
                expires_at: expiryTime
            }
        });

        await email_service.sendOtpUpdateEmail({
            email: validateReq.email,
            username: user.username,
            otp: OTP,
            expiryTime: expiryTime.toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        });
    }

    static async deleteAccount(user: User, req: DeleteAccountRequest) : Promise<void> {
        const isPasswordValid = await argon2.verify(user.password, req.password);
        if(!isPasswordValid) throw new ErrorResponse(403, "Invalid password");

        const deleteDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 day

        await prisma.$transaction(async (tx) => {
            await tx.auth_session.updateMany({
                where: {user_id: user.id},
                data: {revoked_at: new Date()}
            });

            await tx.user.update({
                where: {id: user.id},
                data: {deleted_at: new Date(), deleted_expires_at: deleteDate}
            });
        });

        await email_service.deleteAccountNotification({
            email: user.email,
            username: user.username,
            deleteDate: deleteDate.toLocaleString(),
        });
    }
}