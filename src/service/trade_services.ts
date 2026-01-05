import { User } from "../../prisma/generated/client";
import prisma from "../application/database";
import { ErrorCode } from "../error/error-code";
import { ErrorResponse } from "../error/error_response";
import { CreateTradeRequest, toTradeResponse, TradeResponse } from "../model/trade_model";
import { calculateRiskAmount, calculateRiskReward } from "../utils/calculateRR";
import { UuidValidator } from "../validation/helpers/uuid_validator";
import { TradeValidation } from "../validation/trade_validation";
import { Validation } from "../validation/validation";

export class TradeServices {
    static async executeTrade(user: User, req: CreateTradeRequest) : Promise<TradeResponse> {
        const validateReq = Validation.validate(TradeValidation.CREATE_TRADE, req);
                
        const trade = await prisma.$transaction(async (tx) => {
            // Verify account ownership
            const account = await tx.accounts.findUnique({
                where: { id: validateReq.account_id, user_id: user.id }
            });

            if (!account) throw new ErrorResponse(404, "Account not found or does not belong to user", ErrorCode.ACCOUNT_NOT_FOUND);
            
            // Validate playbooks ownership
            if(validateReq.playbook_ids.length > 0) {
                const playbooks = await tx.playbooks.findMany({
                    where: { id: { in: validateReq.playbook_ids }, user_id: user.id }
                });

                if (playbooks.length !== validateReq.playbook_ids.length) {
                    throw new ErrorResponse(404, "One or more playbooks not found or do not belong to user", ErrorCode.PLAYBOOK_NOT_FOUND);
                }
            };

            // Calculate Risk Reward
            const risk_reward = calculateRiskReward(validateReq.entry_price, validateReq.sl_price ?? null, validateReq.entry_price ?? null);
            
            // Calculate Risk Amount
            const risk_amount = calculateRiskAmount(validateReq.entry_price, validateReq.sl_price ?? null, validateReq.position_size);
            
            return await tx.trades.create({
                data: {
                    account_id: validateReq.account_id,
                    pair: validateReq.pair,
                    position: validateReq.position,
                    entry_price: validateReq.entry_price,
                    position_size: validateReq.position_size,
                    tp_price: validateReq.tp_price ?? null,
                    sl_price: validateReq.sl_price ?? null,
                    risk_reward: risk_reward,
                    risk_amount: risk_amount,
                    entry_time: validateReq.entry_time,
                    trade_playbooks : {
                        create: validateReq.playbook_ids.map(id => ({
                            playbook: {connect: {id}}
                        })),
                    },
                },
                include: {
                    trade_playbooks: {
                        include: {
                            playbook: { select: {id: true, name: true} }
                        }
                    }
                },
            })
        });

        return toTradeResponse(trade);
    }

    static async getTradeById(user: User, trade_id: string) : Promise<TradeResponse> {
        const validateID = Validation.validate(UuidValidator.UUIDVALIDATOR, trade_id);

        const result = await prisma.trades.findFirst({
            where: {
                id: validateID,
                account: {
                    user_id: user.id,
                }
            },
            include: {
                trade_playbooks: {
                    include: {
                        playbook: {
                            select: {id: true, name: true}
                        }
                    }
                }
            }
        });

        if(!result) throw new ErrorResponse(404, "Trade not found", ErrorCode.TRADE_NOT_FOUND);

        return toTradeResponse(result);
    }
}
