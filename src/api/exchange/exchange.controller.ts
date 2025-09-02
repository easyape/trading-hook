import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import type { OrderResponse, AccountBalance, ProfitInfo, PositionSide } from '../../exchange/types';
import type { ExchangeType } from '../../exchange';

@Controller('api/exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  // Trading methods
  @Post('position/long/open')
  async openLongPosition(
    @Body('exchangeType') exchangeType: ExchangeType,
    @Body('symbol') symbol: string,
    @Body('quantity') quantity: number,
    @Body('price') price?: number,
    @Body('leverage') leverage?: number,
  ): Promise<OrderResponse> {
    return this.exchangeService.openLongPosition(exchangeType, symbol, quantity, price, leverage);
  }

  @Post('position/short/open')
  async openShortPosition(
    @Body('exchangeType') exchangeType: ExchangeType,
    @Body('symbol') symbol: string,
    @Body('quantity') quantity: number,
    @Body('price') price?: number,
    @Body('leverage') leverage?: number,
  ): Promise<OrderResponse> {
    return this.exchangeService.openShortPosition(exchangeType, symbol, quantity, price, leverage);
  }

  @Post('position/long/close')
  async closeLongPosition(
    @Body('exchangeType') exchangeType: ExchangeType,
    @Body('symbol') symbol: string,
    @Body('quantity') quantity: number,
    @Body('price') price?: number,
  ): Promise<OrderResponse> {
    return this.exchangeService.closeLongPosition(exchangeType, symbol, quantity, price);
  }

  @Post('position/short/close')
  async closeShortPosition(
    @Body('exchangeType') exchangeType: ExchangeType,
    @Body('symbol') symbol: string,
    @Body('quantity') quantity: number,
    @Body('price') price?: number,
  ): Promise<OrderResponse> {
    return this.exchangeService.closeShortPosition(exchangeType, symbol, quantity, price);
  }

  // Account information methods
  @Get('account/balance')
  async getAccountBalance(
    @Query('exchangeType') exchangeType: ExchangeType
  ): Promise<{ success: boolean; data?: AccountBalance[]; error?: string }> {
    try {
      const balances = await this.exchangeService.getAccountBalance(exchangeType);
      return { success: true, data: balances };
    } catch (error) {
      console.log('Error getting account balance:', error.message || 'Unknown error');
      return { 
        success: false, 
        error: 'Failed to get account balance: ' + (error.message || 'Unknown error') 
      };
    }
  }

  @Get('account/total-value')
  async getTotalAssetValue(
    @Query('exchangeType') exchangeType: ExchangeType
  ): Promise<{ totalValue: number }> {
    const value = await this.exchangeService.getTotalAssetValue(exchangeType);
    return { totalValue: value };
  }

  // Profit information methods
  @Get('profit/:symbol')
  async getPositionProfit(
    @Param('symbol') symbol: string,
    @Query('exchangeType') exchangeType: ExchangeType,
    @Query('positionSide') positionSide?: PositionSide,
  ): Promise<ProfitInfo> {
    return this.exchangeService.getPositionProfit(exchangeType, symbol, positionSide);
  }

  @Get('profit')
  async getAllProfits(
    @Query('exchangeType') exchangeType: ExchangeType
  ): Promise<ProfitInfo[]> {
    return this.exchangeService.getAllProfits(exchangeType);
  }
}
