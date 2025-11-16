import {Request, Response, NextFunction} from "express";
import logger from "../application/logger";
import {AuthRequestRegister} from "../model/auth_model";
import {AuthService} from "../service/auth_service";

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
}