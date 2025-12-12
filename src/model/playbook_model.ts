import { Playbooks } from "../../prisma/generated/client";

export type PlaybookResponse = {
    id: string;
    name: string;
    description: string;
}

export type CreatePlaybookRequest = {
    name: string;
    description?: string;
}

export function toPlaybookResponse(playbook: Playbooks): PlaybookResponse {
    return {
        id: playbook.id,
        name: playbook.name,
        description: playbook.description,
    }
}