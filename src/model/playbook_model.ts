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

export type UpdatePlaybookRequest = {
    id: string;
    name?: string;
    description?: string;
}

export type GetAllPlaybooksRequest = {
    name?: string;
    page: number;
    size: number;
}

export function toPlaybookResponse(playbook: Playbooks): PlaybookResponse {
    return {
        id: playbook.id,
        name: playbook.name,
        description: playbook.description || "",
    }
}