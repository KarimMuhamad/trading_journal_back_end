import { AuthUserRequest } from "../types/auth_type";
import { NextFunction, Response } from "express";
import { CreatePlaybookRequest, PlaybookResponse, UpdatePlaybookRequest } from "../model/playbook_model";
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

    static async updatePlaybook(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const request: UpdatePlaybookRequest = req.body as UpdatePlaybookRequest;
            request.id = req.params.id;
            const response = await PlaybookService.updatePlaybook(req.user!, request);
            res.status(200).json({
                status: "success",
                message: "Playbook updated successfully",
                data: response
            });

            logger.debug("Update Playboook Succes", JSON.stringify(response));

        } catch (e: any) {
            logger.warn("Create Playbook failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }
}