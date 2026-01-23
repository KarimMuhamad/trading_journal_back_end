import { NextFunction, Response } from "express";
import { AuthUserRequest } from "../types/auth_type";
import logger from "../application/logger";
import { CloseRunningTradeRequest, CreateTradeRequest, getAllTradesRequest, UpdateTradeRequest } from "../model/trade_model";
import { TradeServices } from "../service/trade_services";
import { Validation } from "../validation/validation";
import { TradeValidation } from "../validation/trade_validation";

export class TradeController {
    static async executeTrade(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const requset: CreateTradeRequest = req.body as CreateTradeRequest;
            requset.account_id = req.params.accountId;

            const response = await TradeServices.executeTrade(req.user!, requset);
            res.status(201).json({
                status: "success",
                message: "Trade successfuly executed",
                data: response, 
            });

            logger.info("Executed Trade", response);
        } catch (e: any) {
            logger.warn("Failed to execute trade", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }

    static async getTradeById(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const trade_id = req.params.tradeId;
            
            const response = await TradeServices.getTradeById(req.user!, trade_id);
            res.status(200).json({
                status: "success",
                message: "Successfuly fetched trade by id",
                data: response,
            });

            logger.info("Get Trade By id Succes", response);
        } catch(e: any) {
            logger.warn("Failed to get trade by id", {
                message: e.message,
                status: e.status
            });
            next(e);
        }
    }


    static async closeTrade(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const requset: CloseRunningTradeRequest = req.body as CloseRunningTradeRequest;
            requset.trade_id = req.params.tradeId;

            const response = await TradeServices.closeTrade(req.user!, requset);
            res.status(200).json({
                status: "success",
                message: "Trade Successfuly Closed",
                data: response,
            });

            logger.info("Close Trade Success", response);
        } catch (e: any) {
            logger.warn("Error Closing Trade", {
                message: e.message,
                status: e.status,
            })
            next(e)
        }
    }

    static async updateTradeById(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const request: UpdateTradeRequest = req.body as UpdateTradeRequest;
            request.trade_id = req.params.tradeId;

            const response = await TradeServices.updateTrade(req.user!, request);
            res.status(200).json({
                status: "success",
                message: "Updated trade by id successfuly",
                data: response,
            });
            
            logger.info("Update Trade Successfuly", response);
        } catch (e: any) {
            logger.warn("Error Updated trade by id", {
                message: e.message,
                status: e.status,
            })
            next(e)
        }
    }

    static async deleteTrade(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const trade_id = req.params.tradeId

            await TradeServices.deleteTrade(req.user!, trade_id);
            res.status(200).json({
                status: "success",
                message: "Deleted Trade Successfuly",
            });

            logger.info("Trade Deleted Succes", {id: trade_id});
        } catch(e: any) {
            logger.warn("Error deletede trade", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }

    static async getAllTrades(req: AuthUserRequest, res: Response, next: NextFunction) {
        try {
            const rawQueryParams = {
                account_id: req.params.accountId,
                status: req.query.status, 
                search: req.query.search,
                page: req.query.page, 
                size: req.query.size, 
                from_date: req.query.from,
                to_date: req.query.to, 
            }

            const request: getAllTradesRequest = Validation.validate(TradeValidation.GET_ALL_TRADES, rawQueryParams);

            const response = await TradeServices.getAllTrades(req.user!, request);

            res.status(200).json({
                status: "success",
                message: "All trades fetched successfuly",
                data: response,
            });

            logger.info("Fetched All Trades Success", {
                userId: req.user!.id,
                accountId: request.account_id,
            });

        } catch (e: any) {
            logger.warn("Error fetching all trades", {
                message: e.message,
                status: e.status,
            });
            next(e);
        }
    }
}
