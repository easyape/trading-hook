-- CreateEnum
CREATE TYPE "trading"."OrderType" AS ENUM ('MARKET', 'LIMIT', 'STOP_LIMIT', 'STOP_MARKET', 'TRAILING_STOP');

-- CreateEnum
CREATE TYPE "trading"."OrderSide" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "trading"."OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "trading"."ExchangeName" AS ENUM ('OKX', 'BINANCE');

-- CreateTable
CREATE TABLE "trading"."user_info" (
    "id" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "exchange_name" "trading"."ExchangeName",
    "api_key" TEXT,
    "api_secret" TEXT,
    "pass_phase" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trading"."user_balance" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "usdt_balance" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "gas_balance" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "invest_balance" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "profit" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trading"."trading_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "order_type" "trading"."OrderType" NOT NULL,
    "side" "trading"."OrderSide" NOT NULL,
    "price" DECIMAL(18,8) NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "fee" DECIMAL(18,8) NOT NULL,
    "total_value" DECIMAL(18,8) NOT NULL,
    "status" "trading"."OrderStatus" NOT NULL,
    "exchange_id" TEXT,
    "exchange_name" "trading"."ExchangeName" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "trading_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_info_mobile_number_key" ON "trading"."user_info"("mobile_number");
