import {Request, Response, NextFunction} from "express";
import logger from "../application/logger";
import {AuthChangePasswordRequest, AuthRequestLogin, AuthRequestRegister} from "../model/auth_model";
import {AuthService} from "../service/auth_service";
import {AuthUserRequest} from "../type/auth_type";
import {ErrorResponse} from "../error/error_response";

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const request : AuthRequestRegister = req.body as AuthRequestRegister;
            const response = await AuthService.register(request);
            res.status(201).json({
                status: "success",
                message: "User registered successfully",
                data: response
            });

            logger.info("User registered", {
                username: response.username,
                email: response.email.replace(/(?<=.).(?=[^@]*@)/g, '*')
            });
        } catch (e: any) {
            logger.warn("User Registration failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const request : AuthRequestLogin = req.body as AuthRequestLogin;
            const response = await AuthService.login(request, req.headers['user-agent'] as string, req.headers['x-forwarded-for'] as string);

            const sessionJSON = JSON.stringify({
                sid: response.session_id,
                rt: response.token
            });

            res.cookie('session', sessionJSON, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: response.refreshTokenExpiresIn! - Date.now()
            });

            res.status(200).json({
                status: "success",
                message: "User logged in successfully",
                data: response.authRes,
                accessToken: response.accessToken
            });

            logger.info('User logged in', {
                identifier: request.identifier.replace(/(?<=.).(?=[^@]*@)/g, '*'),
            });

        } catch (e: any) {
            logger.warn("User Login failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }

    static async logout(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const session = req.cookies.session;
            const response = await AuthService.logout(req.user!, session);
            res.clearCookie('session');
            res.status(200).json({
                status: "success",
                message: "User logged out successfully",
                data: response
            });

            logger.info('User logout', {
                username: req.user?.username,
                email: req.user?.email.replace(/(?<=.).(?=[^@]*@)/g, '*'),
            });

        } catch (e: any) {
            logger.warn("User Logout failed", {
                message: e.message,
                status: e.status,
            });

            if (e instanceof ErrorResponse && e.statusCode === 401) {
                res.clearCookie('session');
            }
            next(e);
        }
    }

    static async refreshAccessToken(req: Request, res: Response, next: NextFunction) {
        try {
            const session = req.cookies.session;
            const response = await AuthService.refreshAccessToken(session);
            res.status(200).json({
                status: "success",
                message: "Access token refreshed successfully",
                data: response.authRes,
                accessToken: response.accessToken
            });

            logger.info('User access token refreshed', {username: response.authRes.username});

        } catch (e: any) {
            logger.warn("Access token refresh failed", {
                message: e.message,
                status: e.status,
            });

            if (e instanceof ErrorResponse && e.statusCode === 401) {
                res.clearCookie('session');
            }

            next(e);
        }
    }

    static async sendEmailVerification(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            await AuthService.sendEmailVerification(req.user!);
            res.status(200).json({
                status: "success",
                message: "Email verification link sent successfully"
            });

            logger.info('User send Email Verification', {email : req.user!.email.replace(/(?<=.).(?=[^@]*@)/g, '*')})
        } catch (e: any) {
            logger.warn("Email verification failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }

    static async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.query.token as string;
            await AuthService.verifyEmail(token);
            res.status(200).json({
                status: "success",
                message: "Email verified successfully"
            });

            logger.info('Verification email link clicked', {query: req.url});

        } catch (e: any) {
            logger.warn("Email verification failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }

    static async changePassword(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const session = req.cookies.session;
            await AuthService.changePassword(req.user!, {currentPassword: req.body.currentPassword, newPassword: req.body.newPassword}, session);
            res.status(200).json({
                status: "success",
                message: "Password changed successfully"
            });

            logger.info('User change password', {username: req.user!.username});

        } catch (e: any) {
            logger.warn("Password change failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }

    static async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.body;
            await AuthService.forgotPassword(email);
            res.status(200).json({
                status: "success",
                message: "Password reset link sent successfully"
            });
        } catch (e: any) {
            logger.warn("Request reset password link failed : ", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }
}