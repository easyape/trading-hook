/**
 * Binance Exchange API Implementation
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

export interface BinanceConfig {
  apiKey: string;
  secretKey: string;
  testnet?: boolean;
}

export class BinanceExchange implements ExchangeAPI {
  private baseUrl: string;
  private apiKey: string;
  private secretKey: string;

  constructor(config: BinanceConfig) {
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.baseUrl = config.testnet 
      ? 'https://testnet.binancefuture.com' 
      : 'https://fapi.binance.com';
  }

  /**
   * Generate Binance API signature
   */
  private generateSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex');
  }

  /**
   * Add authentication parameters to query parameters
   */
  private addAuthParams(params: Record<string, any> = {}): Record<string, any> {
    const authParams = {
      ...params,
      timestamp: Date.now(),
    };
    
    // Convert all values to strings
    const queryParams = Object.entries(authParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    // Add signature
    const signature = this.generateSignature(queryParams);
    return { ...authParams, signature };
  }

  /**
   * Make authenticated request to Binance API
   */
  private async request<T>(
    method: string,
    endpoint: string,
    params?: Record<string, any>,
    isPublic: boolean = false
  ): Promise<T> {
    let url = new URL(this.baseUrl + endpoint);
    let queryParams = params || {};
    
    if (!isPublic) {
      queryParams = this.addAuthParams(queryParams);
    }
    
    // Add query parameters to URL
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (!isPublic) {
      headers['X-MBX-APIKEY'] = this.apiKey;
    }
    
    try {
      const response = await fetch(url.toString(), {
        method,
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Binance API error: ${response.status} ${errorText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error('Binance API request failed:', error);
      throw error;
    }
  }

  /**
   * Set leverage for a symbol
   */
  private async setLeverage(symbol: string, leverage: number): Promise<void> {
    await this.request('POST', '/fapi/v1/leverage', {
      symbol,
      leverage
    });
  }

  /**
   * Convert position side to Binance format
   */
  private convertPositionSide(positionSide?: PositionSide): string {
    if (!positionSide) return 'BOTH';
    return positionSide.toUpperCase();
  }

  /**
   * Place an order on Binance
   */
  private async placeOrder(params: OrderParams): Promise<OrderResponse> {
    // Set leverage if provided
    if (params.leverage) {
      await this.setLeverage(params.symbol, params.leverage);
    }
    
    const orderParams: Record<string, any> = {
      symbol: params.symbol,
      side: params.side.toUpperCase(),
      type: params.type.toUpperCase(),
      quantity: params.quantity,
    };
    
    // Add position side if provided
    if (params.positionSide) {
      orderParams.positionSide = this.convertPositionSide(params.positionSide);
    }
    
    // Add price for limit orders
    if (params.type === 'limit' && params.price) {
      orderParams.price = params.price;
      orderParams.timeInForce = 'GTC'; // Good Till Canceled
    }
    
    const response = await this.request<any>('POST', '/fapi/v1/order', orderParams);
    
    return {
      orderId: response.orderId.toString(),
      symbol: response.symbol,
      status: response.status,
      price: response.price ? parseFloat(response.price) : undefined,
      quantity: parseFloat(response.origQty),
      side: response.side.toLowerCase() as OrderSide,
      positionSide: response.positionSide?.toLowerCase() as PositionSide,
      type: response.type.toLowerCase() as 'market' | 'limit',
      timestamp: response.updateTime
    };
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
    const response = await this.request<any>('GET', '/fapi/v2/account');
    
    if (!response || !response.assets) {
      return [];
    }
    
    return response.assets.map((asset: any) => ({
      asset: asset.asset,
      free: parseFloat(asset.availableBalance),
      locked: parseFloat(asset.initialMargin),
      total: parseFloat(asset.walletBalance)
    }));
  }

  /**
   * Get total asset value in USD
   */
  async getTotalAssetValue(): Promise<number> {
    const response = await this.request<any>('GET', '/fapi/v2/account');
    
    if (!response) {
      return 0;
    }
    
    return parseFloat(response.totalWalletBalance);
  }

  /**
   * Get profit information for a specific position
   */
  async getPositionProfit(symbol: string, positionSide?: PositionSide): Promise<ProfitInfo> {
    const response = await this.request<any[]>('GET', '/fapi/v2/positionRisk');
    
    if (!response || response.length === 0) {
      return {
        symbol,
        unrealizedProfit: 0,
        realizedProfit: 0,
        totalProfit: 0,
        positionSide
      };
    }
    
    // Find the position matching the symbol and position side
    const position = response.find(pos => {
      if (pos.symbol !== symbol) return false;
      if (positionSide && pos.positionSide.toLowerCase() !== positionSide) return false;
      return true;
    });
    
    if (!position) {
      return {
        symbol,
        unrealizedProfit: 0,
        realizedProfit: 0,
        totalProfit: 0,
        positionSide
      };
    }
    
    const unrealizedProfit = parseFloat(position.unRealizedProfit);
    
    return {
      symbol,
      unrealizedProfit,
      realizedProfit: 0, // Binance doesn't provide realized profit in position risk API
      totalProfit: unrealizedProfit,
      positionSide: position.positionSide.toLowerCase() as PositionSide
    };
  }

  /**
   * Get profit information for all positions
   */
  async getAllProfits(): Promise<ProfitInfo[]> {
    const response = await this.request<any[]>('GET', '/fapi/v2/positionRisk');
    
    if (!response || response.length === 0) {
      return [];
    }
    
    return response
      .filter(position => parseFloat(position.positionAmt) !== 0)
      .map(position => {
        const unrealizedProfit = parseFloat(position.unRealizedProfit);
        
        return {
          symbol: position.symbol,
          unrealizedProfit,
          realizedProfit: 0, // Binance doesn't provide realized profit in position risk API
          totalProfit: unrealizedProfit,
          positionSide: position.positionSide.toLowerCase() as PositionSide
        };
      });
  }
  
  /**
   * Transfer funds between Binance accounts
   * @param currency Currency to transfer (e.g., 'USDT')
   * @param amount Amount to transfer
   * @param fromAccount Source account type
   * @param toAccount Destination account type
   * @returns Transfer response with success status
   */
  async transferFunds(currency: string, amount: number, fromAccount: AccountType, toAccount: AccountType): Promise<TransferResponse> {
    try {
      // Map AccountType to Binance account types
      const getBinanceAccountType = (accountType: AccountType): string => {
        switch (accountType) {
          case AccountType.FUNDING:
            return 'SPOT';
          case AccountType.TRADING:
            return 'FUTURES';
          case AccountType.UNIFIED:
            return 'UNIFIED';
          default:
            return 'SPOT';
        }
      };
      
      const fromType = getBinanceAccountType(fromAccount);
      const toType = getBinanceAccountType(toAccount);
      
      // For Binance, we would use the Universal Transfer API
      // This is a stub implementation - in a real implementation, we would call the Binance API
      console.log(`Binance transfer: ${amount} ${currency} from ${fromType} to ${toType}`);
      
      // Return a stub response for now
      return {
        success: false,
        error: 'Binance internal transfers not implemented yet'
      };
    } catch (error) {
      console.log('Binance transfer error:', error.message || 'Unknown error');
      return {
        success: false,
        error: error.message || 'Failed to transfer funds'
      };
    }
  }
  
  /**
   * Withdraw to another account within the same exchange (Binance)
   * @param currency Currency to withdraw (e.g., 'USDT')
   * @param amount Amount to withdraw
   * @param toAccount Destination account (another user's Binance account email or ID)
   * @param memo Optional memo/message for the withdrawal
   * @returns Withdrawal response with success status
   */
  async withdrawToExchangeAccount(currency: string, amount: number, toAccount: string, memo?: string): Promise<WithdrawalResponse> {
    try {
      // For Binance, we would use the Internal Transfer API
      // This is a stub implementation - in a real implementation, we would call the Binance API
      console.log(`Binance withdrawal: ${amount} ${currency} to account ${toAccount}${memo ? ' with memo: ' + memo : ''}`);
      
      // Return a stub response for now
      return {
        success: false,
        error: 'Binance internal withdrawals not implemented yet'
      };
    } catch (error) {
      console.log('Binance withdrawal error:', error.message || 'Unknown error');
      return {
        success: false,
        error: error.message || 'Failed to withdraw funds'
      };
    }
  }
}
