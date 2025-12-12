import prisma from "../application/database";
import { CreatePlaybookRequest, PlaybookResponse, toPlaybookResponse } from "../model/playbook_model";
import { PlaybookValidation } from "../validation/playbook_validation";
import { Validation } from "../validation/validation";
import { User } from "../../prisma/generated/client";

export class PlaybookService {
    static async createPlaybook(user: User, req: CreatePlaybookRequest): Promise<PlaybookResponse> {
        const validateReq = Validation.validate(PlaybookValidation.CREATEPLAYBOOK, req);
        const playbook = await prisma.playbooks.create({
            data: {
                user_id: user.id,
                name: validateReq.name,
                description: validateReq.description,
            },
        });
        return toPlaybookResponse(playbook);
    }
}