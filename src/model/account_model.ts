import { Accounts } from "../../prisma/generated/client";

export type AccountResponse = {
  id: string;
  user_id: string;
  nickname: string;
  exchange: string;
  balance: number;
  risk_per_trade: number;
  max_risk_daily: number;
};

export type CreateAccountRequest = {
  user_id: string;
  nickname: string;
  exchange: string;
  balance: number;
  risk_per_trade: number;
  max_risk_daily: number;
};

export function toAccountResponse(account: Accounts): AccountResponse {
  return {
    id: account.id,
    user_id: account.user_id,
    nickname: account.nickname,
    exchange: account.exchange,
    balance: account.balance.toNumber(),
    risk_per_trade: account.risk_per_trade.toNumber(),
    max_risk_daily: account.max_risk_daily.toNumber(),
  };
}
