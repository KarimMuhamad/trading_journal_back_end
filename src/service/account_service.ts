import {User} from "../../prisma/generated/client";
import {AccountResponse, CreateAccountRequest, toAccountResponse} from "../model/account_model";
import {Validation} from "../validation/validation";
import {AccountValidation} from "../validation/account_validation";
import prisma from "../application/database";

export class AccountService {
    static async createAccount(user: User, req: CreateAccountRequest): Promise<AccountResponse> {
        const validateReq = Validation.validate(AccountValidation.CREATE, req);

        const result = await prisma.accounts.create({data: {user_id: user.id, ...validateReq}});

        return toAccountResponse(result);
    }

    static async getAccount(user: User, account_id: string): Promise<AccountResponse> {
        const result = await prisma.accounts.findUnique({where: {id: account_id, user_id: user.id}});
        return toAccountResponse(result!);
    }
}