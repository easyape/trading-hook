/**
 * OKX Exchange API Implementation
 */
import { 
  ExchangeAPI, 
  OrderParams, 
  OrderResponse, 
  AccountBalance, 
  ProfitInfo,
  OrderSide,
  PositionSide,
  AccountType,
  TransferResponse,
  WithdrawalResponse
} from './types';
import crypto from 'crypto';
import axios from 'axios';

export interface OKXConfig {
  apiKey: string;
  secretKey: string;
  passphrase: string;
  testnet?: boolean;
}

export class OKXExchange implements ExchangeAPI {
  private baseUrl: string;
  private apiKey: string;
  private secretKey: string;
  private passphrase: string;
  private testnet: boolean;

  constructor(config: OKXConfig) {
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.passphrase = config.passphrase;
    this.testnet = config.testnet || false;
    // Use the same base URL for both production and testnet
    this.baseUrl = 'https://www.okx.com/api/v5';
    // Testnet flag will be used to add the simulation header
  }

  /**
   * Generate OKX API signature
   */
  private generateSignature(timestamp: string, method: string, requestPath: string, body: string = ''): string {
    const message = timestamp + method + requestPath + body;
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('base64');
  }

  /**
   * Make authenticated request to OKX API
   */
  private async request<T>(
    method: string,
    endpoint: string,
    params?: Record<string, any>,
    data?: Record<string, any>
  ): Promise<T> {
    const timestamp = new Date().toISOString();
    const requestPath = `/api/v5${endpoint}`;
    
    const body = data ? JSON.stringify(data) : '';
    const signature = this.generateSignature(timestamp, method, requestPath, body);
    console.log(`baseUrl: ${this.baseUrl}`)
    
    const url = new URL(this.baseUrl + endpoint);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const headers: Record<string, string> = {
      'OK-ACCESS-KEY': this.apiKey,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': this.passphrase,
      'Content-Type': 'application/json'
    };
    
    // Add simulation header for testnet/sandbox mode
    if (this.testnet) {
      headers['x-simulated-trading'] = '1';
    }
    
    try {
      const axiosResponse = await axios({
        method,
        url: url.toString(),
        headers,
        data: data ? body : undefined,
        timeout: 30000, // 30 second timeout
        // Prevent axios from throwing on non-2xx status codes
        validateStatus: () => true
      });
      
      const response = {
        ok: axiosResponse.status >= 200 && axiosResponse.status < 300,
        status: axiosResponse.status,
        text: async () => JSON.stringify(axiosResponse.data),
        json: async () => axiosResponse.data
      };

      const result = await response.json();
      console.log(`getAllProfits result: ${JSON.stringify(result)}`)
      
      // Only log minimal error information
      if (result.code !== '0') {
        console.log(`OKX API error: ${result.code} ${result.msg}`);
        throw new Error(`OKX API error: ${result.code} ${result.msg}`);
      }
      
      return result.data as T;
    } catch (error) {
      // Simplified error logging
      console.log('OKX API request failed:', error.message || 'Unknown error');
      throw new Error('OKX API request failed: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Convert order parameters to OKX format
   */
  private formatOrderParams(params: OrderParams): Record<string, any> {
    return {
      instId: params.symbol,
      tdMode: 'cross', // Default to cross margin
      side: params.side,
      posSide: params.positionSide,
      ordType: params.type === 'market' ? 'market' : 'limit',
      sz: params.quantity.toString(),
      px: params.price?.toString(),
      lever: params.leverage?.toString()
    };
  }

  /**
   * Parse OKX order response to common format
   */
  private parseOrderResponse(data: any): OrderResponse {
    return {
      orderId: data.ordId,
      symbol: data.instId,
      status: data.state,
      price: data.px ? parseFloat(data.px) : undefined,
      quantity: parseFloat(data.sz),
      side: data.side as OrderSide,
      positionSide: data.posSide as PositionSide,
      type: data.ordType === 'market' ? 'market' : 'limit',
      timestamp: parseInt(data.cTime)
    };
  }

  /**
   * Set leverage for a symbol
   */
  private async setLeverage(symbol: string, leverage: number, positionSide: PositionSide): Promise<void> {
    await this.request('POST', '/account/set-leverage', undefined, {
      instId: symbol,
      lever: leverage.toString(),
      mgnMode: 'cross',
      posSide: positionSide
    });
  }

  /**
   * Place an order on OKX
   */
  private async placeOrder(params: OrderParams): Promise<OrderResponse> {
    const formattedParams = this.formatOrderParams(params);
    
    // Set leverage if provided
    if (params.leverage) {
      await this.setLeverage(params.symbol, params.leverage, params.positionSide || 'long');
    }
    
    const response = await this.request<any[]>('POST', '/trade/order', undefined, formattedParams);
    return this.parseOrderResponse(response[0]);
  }

  /**
   * Open a long position
   */
  async openLongPosition(
    symbol: string, 
    quantity: number, 
    price?: number, 
    leverage?: number
  ): Promise<OrderResponse> {
    return this.placeOrder({
      symbol,
      side: 'buy',
      positionSide: 'long',
      type: price ? 'limit' : 'market',
      quantity,
      price,
      leverage
    });
  }

  /**
   * Open a short position
   */
  async openShortPosition(
    symbol: string, 
    quantity: number, 
    price?: number, 
    leverage?: number
  ): Promise<OrderResponse> {
    return this.placeOrder({
      symbol,
      side: 'sell',
      positionSide: 'short',
      type: price ? 'limit' : 'market',
      quantity,
      price,
      leverage
    });
  }

  /**
   * Close a long position
   */
  async closeLongPosition(
    symbol: string, 
    quantity: number, 
    price?: number
  ): Promise<OrderResponse> {
    return this.placeOrder({
      symbol,
      side: 'sell',
      positionSide: 'long',
      type: price ? 'limit' : 'market',
      quantity,
      price
    });
  }

  /**
   * Close a short position
   */
  async closeShortPosition(
    symbol: string, 
    quantity: number, 
    price?: number
  ): Promise<OrderResponse> {
    return this.placeOrder({
      symbol,
      side: 'buy',
      positionSide: 'short',
      type: price ? 'limit' : 'market',
      quantity,
      price
    });
  }

  /**
   * Get account balance
   */
  async getAccountBalance(): Promise<AccountBalance[]> {
    const response = await this.request<any[]>('GET', '/account/balance');
    
    // Extract balances from response
    const balances: AccountBalance[] = [];
    
    if (response && response[0] && response[0].details) {
      for (const detail of response[0].details) {
        balances.push({
          asset: detail.ccy,
          free: parseFloat(detail.availBal),
          locked: parseFloat(detail.frozenBal),
          total: parseFloat(detail.cashBal)
        });
      }
    }
    
    return balances;
  }

  /**
   * Get total asset value in USD
   */
  async getTotalAssetValue(): Promise<number> {
    const response = await this.request<any[]>('GET', '/account/balance');
    
    if (response && response[0]) {
      // OKX provides totalEq field which is the total equity in USD
      return parseFloat(response[0].totalEq);
    }
    
    return 0;
  }

  /**
   * Get profit information for a specific position
   */
  async getPositionProfit(symbol: string, positionSide?: PositionSide): Promise<ProfitInfo> {
    const params: Record<string, string> = { instId: symbol };
    if (positionSide) {
      params.posSide = positionSide;
    }
    
    const response = await this.request<any[]>('GET', '/account/positions', params);
    
    if (!response || response.length === 0) {
      return {
        symbol,
        unrealizedProfit: 0,
        realizedProfit: 0,
        totalProfit: 0,
        positionSide
      };
    }
    
    const position = response[0];
    const unrealizedProfit = parseFloat(position.upl);
    const realizedProfit = parseFloat(position.realizedPnl);
    
    return {
      symbol,
      unrealizedProfit,
      realizedProfit,
      totalProfit: unrealizedProfit + realizedProfit,
      positionSide: position.posSide as PositionSide
    };
  }

  /**
   * Get profit information for all positions
   */
  async getAllProfits(): Promise<ProfitInfo[]> {
    const response = await this.request<any[]>('GET', '/account/positions');
    
    if (!response || response.length === 0) {
      return [];
    }
    console.log('OKX Positions:', JSON.stringify(response, null, 2))
    
    return response.map(position => {
      const unrealizedProfit = parseFloat(position.upl);
      const realizedProfit = parseFloat(position.realizedPnl);
      
      return {
        symbol: position.instId,
        unrealizedProfit,
        realizedProfit,
        totalProfit: unrealizedProfit + realizedProfit,
        positionSide: position.posSide as PositionSide
      };
    });
  }
  
  /**
   * Transfer funds between OKX accounts (internal transfer)
   * @param currency Currency to transfer (e.g., 'USDT')
   * @param amount Amount to transfer
   * @param fromAccount Source account type (funding, trading, unified)
   * @param toAccount Destination account type (funding, trading, unified)
   * @returns Transfer response with success status and transfer ID
   */
  async transferFunds(currency: string, amount: number, fromAccount: AccountType, toAccount: AccountType): Promise<TransferResponse> {
    try {
      const data = {
        ccy: currency.toUpperCase(),
        amt: amount.toString(),
        from: fromAccount,
        to: toAccount,
        type: '0', // 0: transfer within account, 1: master account to sub-account, 2: sub-account to master account
        subAcct: '', // Only needed for sub-account transfers
      };
      
      const response = await this.request<any[]>('POST', '/asset/transfer', undefined, data);
      
      if (!response || response.length === 0) {
        return { success: false, error: 'Empty response from OKX API' };
      }
      
      const transferResult = response[0];
      return {
        success: true,
        transferId: transferResult.transId
      };
    } catch (error) {
      console.log('OKX transfer error:', error.message || 'Unknown error');
      return {
        success: false,
        error: error.message || 'Failed to transfer funds'
      };
    }
  }
  
  /**
   * Withdraw to another account within the same exchange (OKX)
   * Uses dest=3 parameter for internal withdrawals to other OKX accounts
   * @param currency Currency to withdraw (e.g., 'USDT')
   * @param amount Amount to withdraw
   * @param toAccount Destination account (usually another user's OKX account ID)
   * @param memo Optional memo/message for the withdrawal
   * @returns Withdrawal response with success status and withdrawal ID
   */
  async withdrawToExchangeAccount(currency: string, amount: number, toAccount: string, memo?: string): Promise<WithdrawalResponse> {
    try {
      const data = {
        ccy: currency.toUpperCase(),
        amt: amount.toString(),
        dest: '3', // 3: internal withdrawal to another OKX account
        toAddr: toAccount, // The account to receive the funds
        fee: '0', // For internal transfers, fee is usually 0
        chain: `${currency.toUpperCase()}-${currency.toUpperCase()}`, // Default chain format
        memo: memo || ''
      };
      
      const response = await this.request<any[]>('POST', '/asset/withdrawal', undefined, data);
      
      if (!response || response.length === 0) {
        return { success: false, error: 'Empty response from OKX API' };
      }
      
      const withdrawalResult = response[0];
      return {
        success: true,
        withdrawalId: withdrawalResult.wdId,
        fee: parseFloat(withdrawalResult.fee || '0')
      };
    } catch (error) {
      console.log('OKX withdrawal error:', error.message || 'Unknown error');
      return {
        success: false,
        error: error.message || 'Failed to withdraw funds'
      };
    }
  }
}
