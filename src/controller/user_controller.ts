import logger from "../application/logger";
import { UserService } from "../service/user_service";
import { AuthUserRequest } from "../types/auth_type";
import { NextFunction, Response } from "express";
import {UserResponse} from "../model/user_model";

export class UserController {
    static async getUserProfile(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const response: UserResponse = await UserService.getUserProfile(req.user!);
            res.status(200).json({
                status: "success",
                message: "User profile fetched successfully",
                data: response
            });

            logger.info("Get User Profile success", {
                userId: req.user!.id,
            });

        } catch (e: any) {
            logger.warn("Get User Profile failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }
}