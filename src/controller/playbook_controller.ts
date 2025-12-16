import { AuthUserRequest } from "../types/auth_type";
import { NextFunction, Response } from "express";
import {
    CreatePlaybookRequest,
    GetAllPlaybookDetailRequest,
    PlaybookResponse,
    UpdatePlaybookRequest
} from "../model/playbook_model";
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

    static async getPlayBookById(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const playbookId = req.params.playbookId;
            const response = await PlaybookService.getPlaybookById(req.user!, playbookId);
            res.status(200).json({
                status: "success",
                message: "Playbook fetched successfully",
                data: response
            });
            logger.info("Get Playbook success", response);
        } catch (e: any) {
            logger.warn("Get Playbook failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }

    static async updatePlaybook(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const request: UpdatePlaybookRequest = req.body as UpdatePlaybookRequest;
            request.id = req.params.playbookId;
            const response = await PlaybookService.updatePlaybook(req.user!, request);
            res.status(200).json({
                status: "success",
                message: "Playbook updated successfully",
                data: response
            });

            logger.info("Update Playbook Success", response);

        } catch (e: any) {
            logger.warn("Create Playbook failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }

    static async getAllPlaybooks(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const view = (req.query.view as string) ?? 'basic';

            if (view === 'detailed') {
                const request: GetAllPlaybookDetailRequest = {
                    view: 'detailed',
                    page: Number(req.query.page ?? 1),
                    size: Number(req.query.size ?? 5),
                    search: (req.query.search as string) || undefined,
                }

                const response = await PlaybookService.getAllPlaybookDetailed(req.user!, request);

                res.status(200).json({
                    status: "success",
                    message: "Playbooks fetched successfully",
                    data: response.data,
                    paging: response.paging,
                });

                logger.info("Get All Playbooks (detailed) success", request);
                return;
            }

            const response = await PlaybookService.getAllPlaybookSimple(req.user!);
            res.status(200).json({
                status: "success",
                message: "Playbooks fetched successfully",
                data: response,
            });

            logger.info("Get All Playbooks (basic) success", {
                userId: req.user!.id,
            });
        } catch (e: any) {
            logger.warn("Get All Playbooks failed", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }
}