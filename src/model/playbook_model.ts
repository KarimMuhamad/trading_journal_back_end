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
    view: 'basic' | 'detailed';
}

export type PlaybookStats = {
    total_trades: number;
    winrate: number;
    profit_factor: number;
}

export type PlaybookDetailedResponse = PlaybookResponse & {stats: PlaybookStats};

export function toPlaybookResponse(playbook: Playbooks): PlaybookResponse {
    return {
        id: playbook.id,
        name: playbook.name,
        description: playbook.description || "",
    }
}