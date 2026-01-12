import { calculateRiskAmount, calculateRiskReward } from "../utils/calculateRR";
import { Prisma, TradeStatus, User } from "../../prisma/generated/client";
import prisma from "../application/database";
import { ErrorCode } from "../error/error-code";
import { ErrorResponse } from "../error/error_response";
import { CloseRunningTradeRequest, CreateTradeRequest, toTradeResponse, TradeResponse, UpdateTradeRequest } from "../model/trade_model";
import { UuidValidator } from "../validation/helpers/uuid_validator";
import { TradeValidation } from "../validation/trade_validation";
import { Validation } from "../validation/validation";
import { calculateRiskRewardActual, calculateTradeDuration, resultClassification } from "../utils/closeTradeCalculate";
import { setDefined } from "../utils/setDefined";
import { id, is, tr } from "zod/v4/locales";
import { set } from "zod";

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
            }

            // Calculate Risk Reward
            const risk_reward = calculateRiskReward(validateReq.entry_price, validateReq.sl_price ?? null, validateReq.tp_price ?? null);
            
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
    
    static async closeTrade(user: User, req: CloseRunningTradeRequest) : Promise<TradeResponse> {
        const validateReq = Validation.validate(TradeValidation.CLOSE_TRADE, req);

        const trade = await prisma.trades.findUnique({
            where: {
                id: validateReq.trade_id,
                account: {
                    user_id: user.id,
                }
            },
        });

        if(!trade) throw new ErrorResponse(404, "Trade not Found", ErrorCode.TRADE_NOT_FOUND);

        if(trade.status !== TradeStatus.Running) throw new ErrorResponse(400, "Trade Already Closed");
        
        if(validateReq.exit_time < trade.entry_time) throw new ErrorResponse(400, "Exit time cannot be before entry time");

        // Trade Duration Calculation
        const trade_duration = calculateTradeDuration(trade.entry_time, validateReq.exit_time);

        // Risk Reward Actual Calculation
        const rr_actual = calculateRiskRewardActual(validateReq.pnl, trade.risk_amount?.toNumber() ?? null);

        // Trade Result Classification
        const trade_result = resultClassification(validateReq.pnl, rr_actual);

        const result = await prisma.trades.update({
            where: {
                id: validateReq.trade_id,
                account: {
                    user_id: user.id,
                }
            },
            data: {
                exit_time: validateReq.exit_time,
                exit_price: validateReq.exit_price,
                pnl: validateReq.pnl,
                trade_duration,
                rr_actual,
                trade_result,
                status: TradeStatus.Closed,
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

        return toTradeResponse(result);
    }

    static async updateTrade(user: User, req: UpdateTradeRequest) : Promise<TradeResponse> {
        const validateReq = Validation.validate(TradeValidation.UPDATE_TRADE, req);

        const trade = await prisma.trades.findFirst({
            where: {
                id: validateReq.trade_id,
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

        if(!trade) throw new ErrorResponse(404, "Trade not found", ErrorCode.TRADE_NOT_FOUND);
        
        const isClosed = trade.status === TradeStatus.Closed; 
        
        const updateData: Prisma.TradesUpdateInput = {};

        // Fields allowed for both status
        setDefined(updateData, 'notes', validateReq.notes);
        setDefined(updateData, 'link_img', validateReq.link_img);

        // Fields allowed for RUNNING only
        if(!isClosed) {
            setDefined(updateData, 'pair', validateReq.pair);
            setDefined(updateData, 'entry_time', validateReq.entry_time);
            setDefined(updateData, 'entry_price', validateReq.entry_price);
            setDefined(updateData, 'position', validateReq.position);
            setDefined(updateData, 'position_size', validateReq.position_size);
            setDefined(updateData, 'tp_price', validateReq.tp_price);
            setDefined(updateData, 'sl_price', validateReq.sl_price);

            const shouldRecalculate = 
                validateReq.entry_price !== undefined ||
                validateReq.sl_price !== undefined ||
                validateReq.tp_price !== undefined ||
                validateReq.position_size !== undefined;

            if(shouldRecalculate) {
                const entry_price = validateReq.entry_price ?? trade.entry_price.toNumber();
                const sl_price = validateReq.sl_price ?? trade.sl_price?.toNumber();
                const tp_price = validateReq.tp_price ?? trade.tp_price?.toNumber();
                const position_size = validateReq.position_size ?? trade.position_size.toNumber();

                updateData.risk_reward = calculateRiskReward(entry_price, sl_price ?? null, tp_price ?? null);
                updateData.risk_amount = calculateRiskAmount(entry_price, sl_price ?? null, position_size ?? null);
            }

            if(validateReq.playbook_ids) {
                updateData.trade_playbooks = {
                    deleteMany: {
                        trade_id: trade.id
                    },
                    create: validateReq.playbook_ids.map((id) => ({
                        playbook_id: id
                    })),
                };
            }
        }

        if(Object.keys(updateData).length === 0) {
            throw new ErrorResponse(400, 'No valid fields to update for current trade status');
        }

        const result = await prisma.trades.update({
            where: {
                id: trade.id
            },
            data: updateData,
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

        return toTradeResponse(result);
    }

    static async deleteTrade(user: User, trade_id: string) : Promise<void> {
        const validateID = Validation.validate(UuidValidator.UUIDVALIDATOR, trade_id);

        const trade = await prisma.trades.findFirst({
            where : {
                id: validateID,
                account: {
                    user_id: user.id,
                },
            },
            select: {
                id: true,
                status: true,
            }
        })

        if(!trade) {
            throw new ErrorResponse(404, "Trade Not Found", ErrorCode.TRADE_NOT_FOUND);
        }

        if(trade.status !== TradeStatus.Closed) {
            throw new ErrorResponse(400, "Only Closed trade can be deleted");
        }

        await prisma.trades.delete({
            where: {
                id: trade.id
            }
        });
    }
}
