import {Request, Response, NextFunction} from "express";
import logger from "../application/logger";
import {AuthRequestLogin, AuthRequestRegister} from "../model/auth_model";
import {AuthService} from "../service/auth_service";
import {AuthUserRequest} from "../type/auth_type";

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
        } catch (e) {
            next(e);
            logger.warn(`User registration failed : ${e}`, {request: req.statusCode});
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

        } catch (e) {
            next(e);
            logger.warn(`User login failed : ${e}`, {request: req.statusCode});
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

        } catch (e) {
            next(e);
            logger.warn(`User logout failed : ${e}`, {request: req.statusCode});
        }
    }
}