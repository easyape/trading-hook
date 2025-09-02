/**
 * Common types and interfaces for exchange interactions
 */

export type OrderSide = 'buy' | 'sell';
export type PositionSide = 'long' | 'short';
export type OrderType = 'market' | 'limit';

export interface OrderParams {
  symbol: string;
  side: OrderSide;
  positionSide?: PositionSide;
  type: OrderType;
  quantity: number;
  price?: number;
  leverage?: number;
}

export interface OrderResponse {
  orderId: string;
  symbol: string;
  status: string;
  price?: number;
  quantity: number;
  side: OrderSide;
  positionSide?: PositionSide;
  type: OrderType;
  timestamp: number;
}

export interface AccountBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface ProfitInfo {
  symbol: string;
  unrealizedProfit: number;
  realizedProfit: number;
  totalProfit: number;
  positionSide?: PositionSide;
}

// Define account types for internal account transfers (within the same exchange)
export enum AccountType {
  FUNDING = 'funding',  // Funding/Asset/Spot account
  TRADING = 'trading',  // Futures/Margin trading account
  UNIFIED = 'unified'   // Unified account (if supported by exchange)
}

// Define internal transfer response interface
export interface TransferResponse {
  success: boolean;
  transferId?: string;
  error?: string;
}

// Define withdrawal response interface
export interface WithdrawalResponse {
  success: boolean;
  withdrawalId?: string;
  fee?: number;
  error?: string;
}

export interface ExchangeAPI {
  // Trading methods
  openLongPosition(symbol: string, quantity: number, price?: number, leverage?: number): Promise<OrderResponse>;
  openShortPosition(symbol: string, quantity: number, price?: number, leverage?: number): Promise<OrderResponse>;
  closeLongPosition(symbol: string, quantity: number, price?: number): Promise<OrderResponse>;
  closeShortPosition(symbol: string, quantity: number, price?: number): Promise<OrderResponse>;
  
  // Account information methods
  getAccountBalance(): Promise<AccountBalance[]>;
  getTotalAssetValue(): Promise<number>;
  
  // Profit information methods
  getPositionProfit(symbol: string, positionSide?: PositionSide): Promise<ProfitInfo>;
  getAllProfits(): Promise<ProfitInfo[]>;
  
  // Internal account transfer methods (within the same exchange, between account types)
  // For example: transfer from funding/asset account to trading account
  transferFunds(currency: string, amount: number, fromAccount: AccountType, toAccount: AccountType): Promise<TransferResponse>;
  
  // Withdraw to another account within the same exchange
  // For example: withdraw USDT from your account to another user's account on the same exchange
  withdrawToExchangeAccount(currency: string, amount: number, toAccount: string, memo?: string): Promise<WithdrawalResponse>;
}
