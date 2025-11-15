import {AuthRequestRegister, AuthResponse, toAuthResponse} from "../model/auth_model";
import {Validation} from "../validation/validation";
import {AuthValidation} from "../validation/auth_validation";
import prisma from "../application/database";
import {ErrorResponse} from "../error/error_response";
import argon2 from "argon2";

export class AuthService {
    static async register(req: AuthRequestRegister ) : Promise<AuthResponse> {
        const registerRequest = Validation.validate(AuthValidation.REGISTER, req);

        const isUsernameExists = await prisma.user.findFirst({
            where: {
                username: registerRequest.username
            }
        });

        if (isUsernameExists) {
            throw new ErrorResponse(409, "Username already exists");
        }

        const isEmailExists = await prisma.user.findFirst({
            where: {
                email: registerRequest.email
            }
        });

        if (isEmailExists) {
            throw new ErrorResponse(409, "Email already exists");
        }

        registerRequest.password = await argon2.hash(registerRequest.password);
        const user = await prisma.user.create({
            data: registerRequest
        });

        return toAuthResponse(user);
    }
}