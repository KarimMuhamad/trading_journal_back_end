import { AuthUserRequest } from "../types/auth_type";
import { NextFunction, Response } from "express";
import { CreatePlaybookRequest, PlaybookResponse } from "../model/playbook_model";
import { PlaybookService } from "../service/playbook_service";
import logger from "../application/logger";

export class PlaybookController {
    static async createPlaybook(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const request: CreatePlaybookRequest = req.body as CreatePlaybookRequest;
            const response: PlaybookResponse = await PlaybookService.createPlaybook(req.user!, request);
            res.status(201).json({
                status: "success",
                message: "Playbook created successfully",
                data: response
            });

            logger.info("Create Playbook success", {
                userId: req.user!.id,
            });
        } catch (e: any) {
            logger.warn("Create Playbook failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }
}