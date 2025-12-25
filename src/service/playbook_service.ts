import prisma from "../application/database";
import {
    CreatePlaybookRequest, GetAllPlaybookDetailRequest, PlaybookDetailedResponse,
    PlaybookResponse,
    toPlaybookResponse,
    UpdatePlaybookRequest
} from "../model/playbook_model";
import { PlaybookValidation } from "../validation/playbook_validation";
import { Validation } from "../validation/validation";
import {TradeResult, TradeStatus, User} from "../../prisma/generated/client";
import { ErrorResponse } from "../error/error_response";
import { ErrorCode } from "../error/error-code";
import {Pageable} from "../model/page";
import {calculatePlaybooksStats} from "../utils/calculatePlaybooksStats";
import {UuidValidator} from "../validation/helpers/uuid_validator";

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

    static async findPlaybookById(user_id: string, playbook_id: string) {
        const playbook = await prisma.playbooks.findUnique({
            where: {id: playbook_id, user_id: user_id}
        });

        if(!playbook) throw new ErrorResponse(404, "Playbooks not Founds", ErrorCode.PLAYBOOK_NOT_FOUND);

        return playbook;
    }

    static async getPlaybookById(user: User, playbook_id: string) : Promise<PlaybookResponse> {
        const validateId = Validation.validate(UuidValidator.UUIDVALIDATOR, playbook_id);
        const playbook = await this.findPlaybookById(user.id, validateId);
        return toPlaybookResponse(playbook);
    }

    static async updatePlaybook(user: User, req: UpdatePlaybookRequest): Promise<PlaybookResponse> {
        const validateReq = Validation.validate(PlaybookValidation.UPDATEPLAYBOOK, req);
        await this.findPlaybookById(user.id, req.id);

        const result = await prisma.playbooks.update({
            where: { id: req.id },
            data: {
                name: validateReq.name,
                description: validateReq.description,
            },
        });

        return toPlaybookResponse(result);
    }

    static async getAllPlaybookSimple(user: User): Promise<PlaybookResponse[]> {
        const playbooks = await prisma.playbooks.findMany({
            where: {user_id: user.id},
            orderBy: {created_at: 'desc'}
        });
        return playbooks.map(playbook => toPlaybookResponse(playbook));
    }

    static async getAllPlaybookDetailed(user: User, req: GetAllPlaybookDetailRequest): Promise<Pageable<PlaybookDetailedResponse>> {
        const validateReq = Validation.validate(PlaybookValidation.GETALLPLAYBOOK, req);

        let where: any = {user_id: user.id};
        if(validateReq.search) {
            where = {...where,
                OR: [
                    {name: {contains: validateReq.search, mode: 'insensitive'}},
                    {description: {contains: validateReq.search, mode: 'insensitive'}}
                ]
            };
        }

        const skip = (validateReq.page - 1) * validateReq.size;
        const total = await prisma.playbooks.count({where: where});

        const playbooks = await prisma.playbooks.findMany({
            where: where,
            skip: skip,
            take: validateReq.size,
            orderBy: {created_at: 'desc'}
        });

        const playbooksIds = playbooks.map(playbook => playbook.id);

        const relations = await prisma.tradePlaybooks.findMany({
            where: {
                playbook_id: {in: playbooksIds},
                trade: {
                    status: {equals: TradeStatus.Closed},
                }
            },
            select: {
                playbook_id: true,
                trade: {
                    select: {
                        trade_result: true,
                        pnl: true
                    }
                }
            }
        });

        const tradeMap = new Map<string, {trade_result: TradeResult; pnl: number}[]>();

        for (const r of relations) {
            if (!tradeMap.has(r.playbook_id)) {
                tradeMap.set(r.playbook_id, []);
            }
            tradeMap.get(r.playbook_id)!.push({
                trade_result: r.trade.trade_result!,
                pnl: r.trade.pnl!.toNumber()
            });
        }

        const data: PlaybookDetailedResponse[] = playbooks.map(pb => {
            const trades = tradeMap.get(pb.id) ?? [];

            return {
                ...toPlaybookResponse(pb),
                stats: calculatePlaybooksStats(trades)
            }
        });

        return {
            data,
            paging: {
                page: validateReq.page,
                size: validateReq.size,
                total: Math.ceil(total / validateReq.size)
            }
        }

    }

    static async delete(user: User, playbook_id: string) : Promise<PlaybookResponse> {
        const validateReq = Validation.validate(UuidValidator.UUIDVALIDATOR, playbook_id);
        await this.findPlaybookById(user.id, validateReq);

        const result = await prisma.playbooks.delete({
            where: {id: validateReq}
        });

        return toPlaybookResponse(result);
    }
}