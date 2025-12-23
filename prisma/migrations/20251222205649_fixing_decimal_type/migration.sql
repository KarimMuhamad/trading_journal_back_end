/*
  Warnings:

  - You are about to alter the column `balance` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,8)`.
  - You are about to alter the column `max_risk_daily` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,4)`.
  - You are about to alter the column `risk_per_trade` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,4)`.
  - You are about to alter the column `entry_price` on the `trades` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,8)`.
  - You are about to alter the column `position_size` on the `trades` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,8)`.
  - You are about to alter the column `sl_price` on the `trades` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,8)`.
  - You are about to alter the column `tp_price` on the `trades` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,8)`.
  - You are about to alter the column `pnl` on the `trades` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,8)`.
  - You are about to alter the column `risk_reward` on the `trades` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to alter the column `rr_actual` on the `trades` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.

*/
-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "balance" DROP DEFAULT,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "max_risk_daily" DROP DEFAULT,
ALTER COLUMN "max_risk_daily" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "risk_per_trade" DROP DEFAULT,
ALTER COLUMN "risk_per_trade" SET DATA TYPE DECIMAL(5,4);

-- AlterTable
ALTER TABLE "trades" ALTER COLUMN "entry_price" DROP DEFAULT,
ALTER COLUMN "entry_price" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "position_size" DROP DEFAULT,
ALTER COLUMN "position_size" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "sl_price" DROP NOT NULL,
ALTER COLUMN "sl_price" DROP DEFAULT,
ALTER COLUMN "sl_price" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "tp_price" DROP NOT NULL,
ALTER COLUMN "tp_price" DROP DEFAULT,
ALTER COLUMN "tp_price" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "trade_duration" DROP NOT NULL,
ALTER COLUMN "trade_duration" DROP DEFAULT,
ALTER COLUMN "pnl" DROP NOT NULL,
ALTER COLUMN "pnl" DROP DEFAULT,
ALTER COLUMN "pnl" SET DATA TYPE DECIMAL(18,8),
ALTER COLUMN "risk_reward" DROP NOT NULL,
ALTER COLUMN "risk_reward" DROP DEFAULT,
ALTER COLUMN "risk_reward" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "rr_actual" DROP NOT NULL,
ALTER COLUMN "rr_actual" DROP DEFAULT,
ALTER COLUMN "rr_actual" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "trade_result" DROP NOT NULL;
