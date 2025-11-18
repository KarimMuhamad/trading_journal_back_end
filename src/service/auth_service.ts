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
import crypto from  'crypto';
import {User} from "../../prisma/generated/client";
import {UAParser} from "ua-parser-js";

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

    static async login(req: AuthRequestLogin, userAgent : string, ipAddress: string) : Promise<AuthLoginResponse> {
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
        const token = crypto.randomBytes(63).toString('hex');

        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET!, {expiresIn: '25m'});
        const refreshToken = await argon2.hash(token);

        const parser = new UAParser(userAgent);
        const uaResult = parser.getResult();

        await prisma.auth_session.create({
            data: {
                user_id: user.id,
                token: refreshToken,
                device_info: uaResult.device.model || 'Unknown',
                user_agent: userAgent,
                ip_address: ipAddress,
                browser: uaResult.browser.name || 'Unknown',
                os: uaResult.os.name || 'Unknown',
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