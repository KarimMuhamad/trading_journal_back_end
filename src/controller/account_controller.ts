import {AuthUserRequest} from "../types/auth_type";
import {Response, NextFunction} from "express";
import logger from "../application/logger";
import {CreateAccountRequest} from "../model/account_model";
import {AccountService} from "../service/account_service";

export class AccountController {
    static async createAccount(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const request: CreateAccountRequest = req.body as CreateAccountRequest;
            const response = await AccountService.createAccount(req.user!, request);
            res.status(201).json({
                status: "success",
                message: "Account created successfully",
                data: response
            });
            logger.info("Create Account success", response);
        } catch (e: any) {
            logger.warn("Create Account failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }
}