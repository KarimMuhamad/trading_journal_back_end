import {User} from "../../prisma/generated/client";
import {AccountResponse, CreateAccountRequest, toAccountResponse, UpdateAccountRequest} from "../model/account_model";
import {Validation} from "../validation/validation";
import {AccountValidation} from "../validation/account_validation";
import prisma from "../application/database";
import {ErrorResponse} from "../error/error_response";
import {UuidValidator} from "../validation/helpers/uuid_validator";
import {ErrorCode} from "../error/error-code";

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

        await this.findAccountById(user.id, validateId);

        const result = await prisma.accounts.delete({where: {id: validateId}});
        return toAccountResponse(result);
    }
}