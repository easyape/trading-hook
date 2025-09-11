import { Injectable } from '@nestjs/common';
import { 
  ExchangeAPI, 
  OrderResponse, 
  AccountBalance, 
  ProfitInfo, 
  PositionSide,
  createExchange,
  ExchangeFactoryConfig,
  ExchangeType
} from './index';

@Injectable()
export class ExchangeService {
  private exchanges: Record<ExchangeType, ExchangeAPI> = {} as any;

  constructor() {
    // Initialize both exchanges
    // In a real application, you would use ConfigService to load configuration
    // from environment variables or inject the configuration
    
    // Initialize Binance exchange
    this.exchanges['binance'] = createExchange({
      type: 'binance',
      apiKey: process.env.BINANCE_API_KEY || '',
      secretKey: process.env.BINANCE_SECRET_KEY || '',
      testnet: process.env.BINANCE_TESTNET === 'true'
    });
    
    // Initialize OKX exchange
    this.exchanges['okx'] = createExchange({
      type: 'okx',
      apiKey: process.env.OKX_API_KEY || '',
      secretKey: process.env.OKX_SECRET_KEY || '',
      passphrase: process.env.OKX_PASSPHRASE || '',
      testnet: process.env.OKX_TESTNET === 'true'
    });
  }

  // Helper method to get exchange API by type
  private getExchange(exchangeType: ExchangeType): ExchangeAPI {
    if (!this.exchanges[exchangeType]) {
      throw new Error(`Exchange type ${exchangeType} not supported`);
    }
    return this.exchanges[exchangeType];
  }

  // Trading methods
  async openLongPosition(exchangeType: ExchangeType, symbol: string, quantity: number, price?: number, leverage?: number): Promise<OrderResponse> {
    return this.getExchange(exchangeType).openLongPosition(symbol, quantity, price, leverage);
  }

  async openShortPosition(exchangeType: ExchangeType, symbol: string, quantity: number, price?: number, leverage?: number): Promise<OrderResponse> {
    return this.getExchange(exchangeType).openShortPosition(symbol, quantity, price, leverage);
  }

  async closeLongPosition(exchangeType: ExchangeType, symbol: string, quantity: number, price?: number): Promise<OrderResponse> {
    return this.getExchange(exchangeType).closeLongPosition(symbol, quantity, price);
  }

  async closeShortPosition(exchangeType: ExchangeType, symbol: string, quantity: number, price?: number): Promise<OrderResponse> {
    return this.getExchange(exchangeType).closeShortPosition(symbol, quantity, price);
  }

  // Account information methods
  async getAccountBalance(exchangeType: ExchangeType): Promise<AccountBalance[]> {
    return this.getExchange(exchangeType).getAccountBalance();
  }

  async getTotalAssetValue(exchangeType: ExchangeType): Promise<number> {
    return this.getExchange(exchangeType).getTotalAssetValue();
  }

  // Profit information methods
  async getPositionProfit(exchangeType: ExchangeType, symbol: string, positionSide?: PositionSide): Promise<ProfitInfo> {
    return this.getExchange(exchangeType).getPositionProfit(symbol, positionSide);
  }

  async getAllProfits(exchangeType: ExchangeType): Promise<ProfitInfo[]> {
    return this.getExchange(exchangeType).getAllProfits();
  }
}
