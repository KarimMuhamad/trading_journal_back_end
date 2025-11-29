import {
    AuthChangePasswordRequest, AuthForgotPasswordRequest,
    AuthLoginResponse,
    AuthRefreshAccessTokenResponse,
    AuthRequestLogin,
    AuthRequestRegister,
    AuthResponse,
    toAuthResponse
} from "../model/auth_model";
import 'dotenv/config';
import { Validation } from "../validation/validation";
import { AuthValidation } from "../validation/auth_validation";
import prisma from "../application/database";
import { ErrorResponse } from "../error/error_response";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { User } from "../../prisma/generated/client";
import { UAParser } from "ua-parser-js";
import logger from "../application/logger";
import { parseCookieSession } from "../utils/parseCookieSession";
import email_service from "../email/services/email_service";
import { th } from "zod/v4/locales";

export class AuthService {

    static async register(req: AuthRequestRegister): Promise<AuthResponse> {
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

    static async login(req: AuthRequestLogin, userAgent: string, ipAddress: string): Promise<AuthLoginResponse> {
        const loginRequest = Validation.validate(AuthValidation.LOGIN, req);

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: loginRequest.identifier },
                    { email: loginRequest.identifier }
                ],
                includeDeleted: true
            } as any
        });

        if (!user) {
            throw new ErrorResponse(401, "Invalid Email/Username or Password");
        }

        const isPasswordValid = await argon2.verify(user.password, loginRequest.password);
        if (!isPasswordValid) {
            throw new ErrorResponse(401, "Invalid Email/Username or Password");
        }

        if (user.deleted_at && user.deleted_expires_at! >= new Date()) {
            const token = crypto.randomBytes(32).toString('hex');
            const tokenExpiredAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

            await prisma.accountRecoveryTokens.create({
                data: {
                    user_id: user.id,
                    token: token,
                    expires_at: tokenExpiredAt
                }
            });

            return {
                status: "RECOVERY_NEEDED",
                message: "Account recovery needed. Your account has been scheduled for deletion.",
                token: token,
                recovery_period: user.deleted_expires_at!.getTime() - Date.now()
            }

        } else if (user.deleted_at && user.deleted_expires_at! < new Date()) {
            throw new ErrorResponse(401, "Invalid Email/Username or Password");
        }

        const refreshTokenExpiresIn = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days

        const payload = { id: user.id };
        const token = crypto.randomBytes(63).toString('hex');

        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET!, { expiresIn: '25m' });
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
            status: "SUCCESS",
            authRes: toAuthResponse(user),
            accessToken: accessToken,
            session_id: session.id,
            token,
            refreshTokenExpiresIn
        }

    }

    static async logout(user: User, sessionJSON: any): Promise<AuthResponse> {
        const { sid, rt } = parseCookieSession(sessionJSON);

        const session = await prisma.auth_session.findFirst({
            where: {
                id: sid,
                user_id: user.id,
                expires_at: { gt: new Date() }
            }
        });

        if (!session) throw new ErrorResponse(401, "Unauthorized, invalid session");

        if (await argon2.verify(session.token, rt)) {
            await prisma.auth_session.update({
                where: { id: session.id },
                data: { revoked_at: new Date() }
            });

            logger.info('Session revoked', { sessionJSON });

            return toAuthResponse(user);

        } else {
            throw new ErrorResponse(401, "Unauthorized, invalid session");
        }
    }

    static async refreshAccessToken(sessionJSON: any): Promise<AuthRefreshAccessTokenResponse> {
        const { sid, rt } = parseCookieSession(sessionJSON);
        const session = await prisma.auth_session.findFirst({
            where: {
                id: sid,
                revoked_at: null,
                expires_at: { gt: new Date() }
            }
        });

        if (!session) throw new ErrorResponse(401, "Unauthorized, invalid or expired session");

        const isValidSession = await argon2.verify(session.token, rt);
        if (!isValidSession) {
            await prisma.auth_session.update({
                where: { id: session.id },
                data: { revoked_at: new Date() }
            });

            logger.warn('Miss Match Session and Revoked it', { sessionJSON });

            throw new ErrorResponse(401, "Unauthorized, invalid session");
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user_id }
        });

        if (!user) throw new ErrorResponse(401, "Unauthorized, invalid session User no longer exists");

        const payload = { id: user.id };
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET!, { expiresIn: '25m' });

        return {
            authRes: toAuthResponse(user),
            accessToken: accessToken,
        }
    }

    static async sendEmailVerification(user: User): Promise<void> {
        const isUserVerified = await prisma.user.findUnique({
            where: {
                id: user.id,
                is_verified: true
            },
        });

        if (isUserVerified) throw new ErrorResponse(400, "User already verified");

        const token = crypto.randomBytes(32).toString('hex');

        const expiredTime = new Date(Date.now() + 1000 * 60 * 30);

        await prisma.emailVerification.create({
            data: {
                user_id: user.id,
                token: token,
                expires_at: expiredTime
            }
        });

        await email_service.sendEmailVerificationEmail({
            email: user.email,
            username: user.username,
            verificationToken: token,
            expiryTime: expiredTime.toLocaleString(),
        });
    }

    static async verifyEmail(token: string): Promise<void> {
        const verification = await prisma.emailVerification.findFirst({
            where: {
                token: token,
                used: false,
                expires_at: { gt: new Date() }
            }
        });

        if (!verification) throw new ErrorResponse(401, "Invalid or expired verification link");

        await prisma.$transaction(async (tx) => {
            const updated = await tx.emailVerification.updateMany({
                where: { id: verification.id, used: false },
                data: { used: true }
            });

            if (updated.count === 0) throw new ErrorResponse(401, "Verification link already used");

            await tx.user.update({
                where: { id: verification.user_id },
                data: { is_verified: true }
            });
        });
    }

    static async changePassword(user: User, req: AuthChangePasswordRequest, sessionJSON: any, userAgent: string): Promise<void> {
        const { sid } = parseCookieSession(sessionJSON);
        const changePasswordRequest = Validation.validate(AuthValidation.CHANGEPASSWORD, req);

        const isCurrentPasswordValid = await argon2.verify(user.password, changePasswordRequest.currentPassword);
        if (!isCurrentPasswordValid) throw new ErrorResponse(401, "Invalid current password");

        const hashedNewPassword = await argon2.hash(changePasswordRequest.newPassword);

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: user.id },
                data: { password: hashedNewPassword }
            });

            const result = await tx.auth_session.updateMany({
                where: {
                    user_id: user.id,
                    id: { not: sid },
                    revoked_at: null
                },
                data: { revoked_at: new Date() }
            });

            logger.warn('User password changed from setting pages, All Session Revoked :', {
                userID: user.id,
                revokedCount: result.count,
                sessionID: sid
            });
        });

        const uaParser = new UAParser(userAgent);
        const uaResult = uaParser.getResult();

        await email_service.sendPasswordChangedNotification({
            email: user.email,
            username: user.username,
            changedAt: new Date().toLocaleString(),
            deviceInfo: `${uaResult.device.model} | ${uaResult.browser.name} | ${uaResult.os.name}`
        })
    }

    static async forgotPassword(req: AuthForgotPasswordRequest): Promise<void> {
        const forgotPasswordRequest = Validation.validate(AuthValidation.FORGOTPASSWORD, req);

        const user = await prisma.user.findUnique({
            where: { email: forgotPasswordRequest.email }
        });

        if (!user) throw new ErrorResponse(404, "User not found");

        const token = crypto.randomBytes(32).toString('hex');

        const tokenExpiredAt = new Date(Date.now() + 1000 * 60 * 5);

        await prisma.passwordReset.create({
            data: {
                user_id: user.id,
                token: token,
                expires_at: tokenExpiredAt
            }
        });

        await email_service.sendResetPasswordEmail({
            email: user.email,
            resetToken: token,
            username: user.username,
            expiryTIme: tokenExpiredAt.toLocaleString()
        })
    }

    static async resetPassword(req: AuthForgotPasswordRequest, userAgent: string): Promise<void> {
        const token = req.token;

        const passwordReset = await prisma.passwordReset.findFirst({
            where: {
                token: token,
                used: false,
                expires_at: { gt: new Date() }
            }
        });

        if (!passwordReset) throw new ErrorResponse(401, "Invalid or expired password reset link");

        const user = await prisma.user.findUnique({
            where: { id: passwordReset.user_id }
        });
        if (!user) throw new ErrorResponse(404, "User no longer exists");

        const requestNewPassword = Validation.validate(AuthValidation.RESETPASSWORD, req);
        const newPassword = await argon2.hash(requestNewPassword.newPassword!);

        const uaParser = new UAParser(userAgent);
        const uaResult = uaParser.getResult();

        await prisma.$transaction(async (tx) => {
            const mark = await tx.passwordReset.updateMany({
                where: { id: passwordReset.id, used: false },
                data: { used: true }
            });
            if (mark.count === 0) throw new ErrorResponse(401, "Password reset link already used");

            await tx.user.update({
                where: { id: passwordReset.user_id },
                data: { password: newPassword }
            });

            await tx.auth_session.updateMany({
                where: { user_id: passwordReset.user_id },
                data: { revoked_at: new Date() }
            });

            logger.warn('User password changed from reset password link, All Session Revoked :', { userId: passwordReset.user_id });
        });

        await email_service.sendPasswordChangedNotification({
            email: user.email,
            username: user.username,
            changedAt: new Date().toLocaleString(),
            deviceInfo: `${uaResult.device.model} | ${uaResult.browser.name} | ${uaResult.os.name}`
        });
    }

    static async recoveryAccount(token: string): Promise<void> {
        const recoveryToken = await prisma.accountRecoveryTokens.findFirst({
            where: {
                token: token,
                used: false,
                expires_at: { gt: new Date() }
            }
        });

        if (!recoveryToken) throw new ErrorResponse(401, "Invalid or expired account recovery token");

        await prisma.$transaction(async (tx) => {
            await tx.accountRecoveryTokens.update({
                where: { token: recoveryToken.token },
                data: { used: true }
            });

            await tx.user.update({
                where: { id: recoveryToken.user_id },
                data: { deleted_at: null, deleted_expires_at: null }
            });
        });
    };
}