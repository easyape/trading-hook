/**
 * Exchange API module exports and factory
 */
import { ExchangeAPI } from './types';
import { OKXExchange, OKXConfig } from './okx';
import { BinanceExchange, BinanceConfig } from './binance';

export * from './types';
export * from './okx';
export * from './binance';

export type ExchangeType = 'okx' | 'binance';

export interface ExchangeFactoryConfig {
  type: ExchangeType;
  apiKey: string;
  secretKey: string;
  passphrase?: string; // Required for OKX
  testnet?: boolean;
}

/**
 * Create an exchange API instance based on configuration
 */
export function createExchange(config: ExchangeFactoryConfig): ExchangeAPI {
  switch (config.type) {
    case 'okx':
      // Use default passphrase if not provided
      const passphrase = config.passphrase || 'default_passphrase';
      console.log(JSON.stringify(config))
      
      return new OKXExchange({
        apiKey: config.apiKey,
        secretKey: config.secretKey,
        passphrase,
        testnet: config.testnet
      } as OKXConfig);
      
    case 'binance':
      return new BinanceExchange({
        apiKey: config.apiKey,
        secretKey: config.secretKey,
        testnet: config.testnet
      } as BinanceConfig);
      
    default:
      throw new Error(`Unsupported exchange type: ${config.type}`);
  }
}

/**
 * Example usage:
 * 
 * // Create OKX exchange instance
 * const okx = createExchange({
 *   type: 'okx',
 *   apiKey: 'YOUR_API_KEY',
 *   secretKey: 'YOUR_SECRET_KEY',
 *   passphrase: 'YOUR_PASSPHRASE',
 *   testnet: true // Use sandbox environment
 * });
 * 
 * // Create Binance exchange instance
 * const binance = createExchange({
 *   type: 'binance',
 *   apiKey: 'YOUR_API_KEY',
 *   secretKey: 'YOUR_SECRET_KEY',
 *   testnet: true // Use testnet environment
 * });
 * 
 * // Open a long position
 * const order = await okx.openLongPosition('BTC-USDT', 0.01, undefined, 10);
 * 
 * // Get account balance
 * const balances = await binance.getAccountBalance();
 */
