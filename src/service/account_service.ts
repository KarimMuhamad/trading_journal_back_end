import {TradeStatus, User} from "../../prisma/generated/client";
import {
    AccountDetailedResponse,
    AccountResponse,
    CreateAccountRequest, GetAllAccountDetailRequest,
    toAccountResponse,
    UpdateAccountRequest
} from "../model/account_model";
import {Validation} from "../validation/validation";
import {AccountValidation} from "../validation/account_validation";
import prisma from "../application/database";
import {ErrorResponse} from "../error/error_response";
import {UuidValidator} from "../validation/helpers/uuid_validator";
import {ErrorCode} from "../error/error-code";
import {Pageable} from "../model/page";

export class AccountService {
    static async createAccount(user: User, req: CreateAccountRequest): Promise<AccountResponse> {
        const validateReq = Validation.validate(AccountValidation.CREATE, req);

        const result = await prisma.accounts.create({data: {user_id: user.id, ...validateReq}});

        return toAccountResponse(result);
    }

    static async findAccountById(user_id: string, account_id: string){
        const result = await prisma.accounts.findUnique({where: {id: account_id, user_id: user_id}});

        if (!result) throw new ErrorResponse(404, "Account not found", ErrorCode.ACCOUNT_NOT_FOUND);

        return result;
    }

    static async getAccountById(user: User, account_id: string): Promise<AccountResponse> {
        const validateId = Validation.validate(UuidValidator.UUIDVALIDATOR, account_id);
        const result = await this.findAccountById(user.id, validateId);
        return toAccountResponse(result!);
    }

    static async updateAccount(user: User, req: UpdateAccountRequest) : Promise<AccountResponse> {
        const validateReq = Validation.validate(AccountValidation.UPDATE, req);

        await this.findAccountById(user.id, validateReq.id);

        const result = await prisma.accounts.update({where: {id: validateReq.id}, data: validateReq});
        return toAccountResponse(result);
    }

    static async deleteAccount(user: User, account_id: string) : Promise<AccountResponse> {
        const validateId = Validation.validate(UuidValidator.UUIDVALIDATOR, account_id);

        const account = await prisma.accounts.findUnique({
            where: {id: validateId, user_id: user.id, includeArchived: true} as any
        });

        if (!account) throw new ErrorResponse(404, "Account not found", ErrorCode.ACCOUNT_NOT_FOUND);
        if (!account.is_archived) throw new ErrorResponse(400, "Archived Account First", ErrorCode.ACCOUNT_NOT_ARCHIVED);

        const result = await prisma.accounts.delete({where: {id: validateId}});
        return toAccountResponse(result);
    }


    static async getAllAccount(user: User, req: GetAllAccountDetailRequest) : Promise<Pageable<AccountDetailedResponse>> {
        const validateReq = Validation.validate(AccountValidation.GETALLACCOUNT, req);

        const skip = (validateReq.page - 1) * validateReq.size;
        const total = await prisma.accounts.count({where: {user_id: user.id}});

        const result = await prisma.$queryRaw<AccountDetailedResponse[]>`
            SELECT a.id, a.user_id, a.nickname, a.exchange, a.balance, a.risk_per_trade, a.max_risk_daily, a.is_archived, a.created_at,
            COUNT(t.id)::int as total_trade, COALESCE(SUM(CASE WHEN t.pnl > 0 THEN t.pnl ELSE 0 END), 0) as total_profit,
            COALESCE(SUM(CASE WHEN t.pnl < 0 THEN t.pnl ELSE 0 END), 0) as total_lose FROM accounts a LEFT JOIN trades t ON t.account_id = a.id
            WHERE a.user_id = ${user.id}::Uuid AND is_archived = FALSE GROUP BY a.id ORDER BY a.created_at DESC LIMIT ${validateReq.size} OFFSET ${skip} 
        `

        return {
            data: result,
            paging: {
                page: validateReq.page,
                size: validateReq.size,
                total: Math.ceil(total / validateReq.size)
            }
        }
    }
}