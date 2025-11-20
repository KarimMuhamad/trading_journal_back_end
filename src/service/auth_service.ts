import {
    AuthLoginResponse,
    AuthRequestLogin,
    AuthRequestRegister,
    AuthResponse,
    toAuthResponse
} from "../model/auth_model";
import 'dotenv/config';
import {Validation} from "../validation/validation";
import {AuthValidation} from "../validation/auth_validation";
import prisma from "../application/database";
import {ErrorResponse} from "../error/error_response";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from  'crypto';
import {User} from "../../prisma/generated/client";
import {UAParser} from "ua-parser-js";
import logger from "../application/logger";
import {parseCookieSession} from "../utils/parseCookieSession";
import {Resend} from "resend";

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
        const refreshTokenHash = await argon2.hash(token);

        const parser = new UAParser(userAgent);
        const uaResult = parser.getResult();

        const session = await prisma.auth_session.create({
            data: {
                user_id: user.id,
                token: refreshTokenHash,
                device_info: uaResult.device.model || 'Unknown',
                user_agent: userAgent,
                ip_address: ipAddress,
                browser: uaResult.browser.name || 'Unknown',
                os: uaResult.os.name || 'Unknown',
                expires_at: new Date(refreshTokenExpiresIn),
                revoked_at: null
            }
        });

        return {
            authRes: toAuthResponse(user),
            accessToken: accessToken,
            session_id: session.id,
            token,
            refreshTokenExpiresIn
        }

    }

    static async logout(user: User, sessionJSON: any) : Promise<AuthResponse> {
        const {sid, rt} = parseCookieSession(sessionJSON);

        const session = await prisma.auth_session.findFirst({
            where: {
                id: sid,
                user_id: user.id,
                expires_at: {gt: new Date()}
            }
        });

        if (!session) throw new ErrorResponse(401, "Unauthorized, invalid session");

        if (await argon2.verify(session.token, rt)) {
            await prisma.auth_session.update({
                where: {id: session.id},
                data: {revoked_at: new Date()}
            });

            logger.info('Session revoked', {sessionJSON});

            return toAuthResponse(user);

        } else {
            throw new ErrorResponse(401, "Unauthorized, invalid session");
        }
    }

    static async refreshAccessToken(sessionJSON: any) : Promise<AuthLoginResponse> {
        const {sid, rt} = parseCookieSession(sessionJSON);
        const session = await prisma.auth_session.findFirst({
            where: {
                id: sid,
                revoked_at: null,
                expires_at: {gt: new Date()}
            }
        });

        if (!session) throw new ErrorResponse(401, "Unauthorized, invalid or expired session");

        const isValidSession = await argon2.verify(session.token, rt);
        if (!isValidSession) {
            await prisma.auth_session.update({
                where: {id: session.id},
                data: {revoked_at: new Date()}
            });

            logger.warn('Miss Match Session and Revoked it', {sessionJSON});

            throw new ErrorResponse(401, "Unauthorized, invalid session");
        }

        const user = await prisma.user.findUnique({
            where: {id: session.user_id}
        });

        if (!user) throw new ErrorResponse(401, "Unauthorized, invalid session User no longer exists");

        const payload = {id: user.id};
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET!, {expiresIn: '25m'});

        return {
            authRes: toAuthResponse(user),
            accessToken: accessToken,
        }
    }

    static async sendEmailVerification(user: User) : Promise<void> {
        const isUserVerified = await prisma.user.findUnique({
            where: {
                id: user.id,
                is_verified: true
            },
        });

        if (isUserVerified) throw new ErrorResponse(400, "User already verified");

        const token = crypto.randomBytes(32).toString('hex');

        await prisma.emailVerification.create({
            data: {
                user_id: user.id,
                token: token,
                expires_at: new Date(Date.now() + 1000 * 60 * 30)
            }
        });

        const verificationLink = `${process.env.FRONTEND_URL}/auth/email/verify?token=${token}`;

        const resend = new Resend(process.env.RESEND_API_KEY!);

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: user.email,
            subject: 'Verify your email address',
            html: `<p>Please click the following link to verify your email address: <a href="${verificationLink}">${verificationLink}</a></p>`
        });
    }

    static async verifyEmail(token: string) : Promise<void> {
        const verification = await prisma.emailVerification.findFirst({
            where: {
                token: token,
                used: false,
                expires_at: {gt: new Date()}
            }
        });

        if (!verification) throw new ErrorResponse(401, "Invalid or expired verification link");

        await prisma.user.update({
            where: {id: verification.user_id},
            data: {is_verified: true}
        });

        await prisma.emailVerification.update({
            where: {id: verification.id},
            data: {used: true}
        });
    }
}