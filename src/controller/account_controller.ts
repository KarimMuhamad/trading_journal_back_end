import {AuthUserRequest} from "../types/auth_type";
import {Response, NextFunction} from "express";
import logger from "../application/logger";
import {CreateAccountRequest, GetAllAccountDetailRequest, UpdateAccountRequest} from "../model/account_model";
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

    static async getAccountById(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const accountId = req.params.accountId;
            const response = await AccountService.getAccountById(req.user!, accountId);
            res.status(200).json({
                status: "success",
                message: "Account fetched successfully",
                data: response
            });
            logger.info("Get Account success", response);
        } catch (e: any) {
            logger.warn("Get Account failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }

    static async updateAccount(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const request: UpdateAccountRequest = req.body as UpdateAccountRequest;
            request.id = req.params.accountId;
            const response = await AccountService.updateAccount(req.user!, request);
            res.status(200).json({
                status: "success",
                message: "Account updated successfully",
                data: response
            });
            logger.info("Update Account success", response);
        } catch (e: any) {
            logger.warn("Update Account failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }

    static async deleteAccount(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const accountId = req.params.accountId;
            const response = await AccountService.deleteAccount(req.user!, accountId);
            res.status(200).json({
                status: "success",
                message: "Account deleted successfully",
                data: response
            });
            logger.info("Delete Account success", response);
        } catch (e: any) {
            logger.warn("Delete Account failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }

    static async getAllAccount(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const request: GetAllAccountDetailRequest = {
                page: Number(req.query.page ?? 1),
                size: Number(req.query.size ?? 5),
            }

            const response = await AccountService.getAllAccount(req.user!, request);

            res.status(200).json({
                status: "success",
                message: "Accounts fetched successfully",
                data: response.data,
                paging: response.paging,
            });

            logger.info("Get All Account success",
                {
                    userId: req.user!.id,
                }
            )
        } catch (e: any) {
            logger.warn("Get All Account failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }
}