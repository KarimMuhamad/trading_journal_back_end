import { NextFunction, Response } from "express";
import { AuthUserRequest } from "../types/auth_type";
import logger from "../application/logger";
import { CloseRunningTradeRequest, CreateTradeRequest, UpdateTradeRequest } from "../model/trade_model";
import { TradeServices } from "../service/trade_services";

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
}
