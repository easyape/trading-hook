import { Controller, Get, Param } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { AccountBalance, ExchangeType } from './index';

@Controller('exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  /**
   * Get account balance for a specific exchange
   * @param exchangeType The type of exchange (binance, okx)
   * @returns Array of account balances
   */
  @Get('balance/:exchangeType')
  async getAccountBalance(@Param('exchangeType') exchangeType: string): Promise<AccountBalance[]> {
    // Convert to lowercase and validate as ExchangeType
    const exchange = exchangeType.toLowerCase() as ExchangeType;
    
    // Get supported exchange types
    const supportedExchangeTypes: ExchangeType[] = ['binance', 'okx'];
    
    // Validate exchange type
    if (!supportedExchangeTypes.includes(exchange)) {
      throw new Error(`Exchange type ${exchange} is not supported. Supported types are: ${supportedExchangeTypes.join(', ')}`);
    }
    
    return this.exchangeService.getAccountBalance(exchange);
  }
}
