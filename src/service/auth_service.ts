import {
    AuthLoginResponse,
    AuthRequestLogin,
    AuthRequestRegister,
    AuthResponse,
    toAuthResponse
} from "../model/auth_model";
import {Validation} from "../validation/validation";
import {AuthValidation} from "../validation/auth_validation";
import prisma from "../application/database";
import {ErrorResponse} from "../error/error_response";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

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

    static async login(req: AuthRequestLogin, deviceInfo : string) : Promise<AuthLoginResponse> {
        const loginRequest = Validation.validate(AuthValidation.LOGIN, req);

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    {username: loginRequest.identifier},
                    {email: loginRequest.identifier}
                ]
            }
        });

        if (!user) {
            throw new ErrorResponse(401, "Invalid Email/Username or Password");
        }

        const isPasswordValid = await argon2.verify(user.password, loginRequest.password);
        if (!isPasswordValid) {
            throw new ErrorResponse(401, "Invalid Email/Username or Password");
        }

        const refreshTokenExpiresIn = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days

        const payload = {id: user.id};

        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET!, {expiresIn: '25m'});
        const refreshToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET!, {expiresIn: '30d'});

        await prisma.refreshToken.create({
            data: {
                user_id: user.id,
                token: refreshToken,
                device_info: deviceInfo || 'unknown',
                expires_at: new Date(refreshTokenExpiresIn)
            }
        });

        return {
            authRes: toAuthResponse(user),
            accessToken: accessToken,
            refreshToken,
            refreshTokenExpiresIn
        }

    }
}