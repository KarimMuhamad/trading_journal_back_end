import prisma from "../application/database";
import { CreatePlaybookRequest, PlaybookResponse, toPlaybookResponse, UpdatePlaybookRequest } from "../model/playbook_model";
import { PlaybookValidation } from "../validation/playbook_validation";
import { Validation } from "../validation/validation";
import { User } from "../../prisma/generated/client";
import { ErrorResponse } from "../error/error_response";
import { ErrorCode } from "../error/error-code";

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

    static async findPLaybookById(user_id: string, playbook_id: string) {
        const playbook = await prisma.playbooks.findUnique({
            where: {id: playbook_id, user_id: user_id}
        });

        if(!playbook) throw new ErrorResponse(404, "Playbooks not Founds", ErrorCode.PLAYBOOK_NOT_FOUND);

        return playbook;
    }

    static async updatePlaybook(user: User, req: UpdatePlaybookRequest, playbook_id: string): Promise<PlaybookResponse> {
        const validateReq = Validation.validate(PlaybookValidation.UPDATEPLAYBOOK, req);
        await this.findPLaybookById(user.id, playbook_id);

        const result = await prisma.playbooks.update({
            where: { id: playbook_id },
            data: {
                name: validateReq.name,
                description: validateReq.description,
            },
        });

        return toPlaybookResponse(result);
    }
}