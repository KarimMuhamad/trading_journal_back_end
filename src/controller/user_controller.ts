import logger from "../application/logger";
import { UserService } from "../service/user_service";
import { AuthUserRequest } from "../types/auth_type";
import { NextFunction, Response } from "express";
import {DeleteAccountRequest, UserResponse, UserUpdateUsernameRequest} from "../model/user_model";

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

    static async updateUsername(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const request: UserUpdateUsernameRequest = {
                username: req.body.username
            }

            const response: UserResponse = await UserService.updateUserName(req.user!, request);
            res.status(200).json({
                status: "success",
                message: "User updated successfully",
                data: response
            });
            logger.info("Update Username success", {
                userId: req.user!.id,
            });
        } catch (e: any) {
            logger.warn("Update Username failed", {
                message: e.message,
                status: e.status,
            });

            next(e);
        }
    }

    static async deleteAccount(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const request: DeleteAccountRequest = {
                password: req.body.password
            }

            await UserService.deleteAccount(req.user!, request);
            res.status(200).json({
                status: "success",
                message: "Account deleted successfully"
            });
            logger.info("Delete Account success", {
                userId: req.user!.id,
            });
        } catch (e: any) {
            logger.warn("Delete Account failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }
}