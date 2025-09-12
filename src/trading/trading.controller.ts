import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { TradingService } from './trading.service';
import { CreateTradingDto } from './dto/create-trading.dto';
import { ExchangeService } from '../exchange/exchange.service';
import { AccountBalance, ExchangeType } from '../exchange';
import { OrderSide, OrderStatus } from '@prisma/client';
import { UsersService } from '../users/users.service';

@Controller('trading')
export class TradingController {
  constructor(
    private readonly tradingService: TradingService,
    private readonly exchangeService: ExchangeService,
    private readonly usersService: UsersService
  ) {}

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

  @Post('create')
  async createTrading(@Body() order: CreateTradingDto) {

    // Find user from user_info table
    const user = await this.usersService.findById(order.userId);
    
    // Validate that user has an exchange configured
    if (!user.exchangeName) {
      throw new Error(`User ${order.userId} does not have an exchange configured`);
    }
    
    const exchangeType = user.exchangeName.toLowerCase() as ExchangeType;
    
    // Create exchange order based on order side
    let exchangeOrder;
    if (order.side === OrderSide.BUY) {
      // Open long position
      exchangeOrder = await this.exchangeService.openLongPosition(
        exchangeType,
        order.symbol,
        order.amount,
        order.price
      );
    } else {
      // Open short position
      exchangeOrder = await this.exchangeService.openShortPosition(
        exchangeType,
        order.symbol,
        order.amount,
        order.price
      );
    }
    
    // Update order with exchange ID if available
    if (exchangeOrder && exchangeOrder.orderId) {
      order.exchangeId = exchangeOrder.orderId;
      order.status = OrderStatus.PENDING;
    }
    
    // Create trading history record
    return this.tradingService.createTradingHistory(order);
  }

  @Post('order/:id/close')
  async closeTrading(@Param('id') id: string) {
    // Get trading history record
    const tradingHistory = await this.tradingService.findTradingHistoryById(id);
    
    if (!tradingHistory) {
      throw new Error(`Trading history with ID ${id} not found`);
    }
    
    // Map exchange name to exchange type
    const exchangeType = tradingHistory.exchangeName.toLowerCase() as ExchangeType;
    
    // Close position based on original order side
    let exchangeOrder;
    if (tradingHistory.side === OrderSide.BUY) {
      // Close long position
      exchangeOrder = await this.exchangeService.closeLongPosition(
        exchangeType,
        tradingHistory.symbol,
        Number(tradingHistory.amount),
      );
    } else {
      // Close short position
      exchangeOrder = await this.exchangeService.closeShortPosition(
        exchangeType,
        tradingHistory.symbol,
        Number(tradingHistory.amount),
      );
    }
    
    // Update trading history status to COMPLETED
    await this.tradingService.updateTradingHistoryStatus(id, OrderStatus.COMPLETED);
    
    return {
      message: 'Position closed successfully',
      tradingHistoryId: id,
      exchangeOrderId: exchangeOrder?.orderId,
      status: OrderStatus.COMPLETED
    };
  }

  @Get('history')
  async findAllTradingHistory() {
    return this.tradingService.findAllTradingHistory();
  }

  @Get('history/user/:userId')
  async findUserTradingHistory(@Param('userId') userId: string) {
    return this.tradingService.findUserTradingHistory(userId);
  }

  @Get('history/:id')
  async findTradingHistoryById(@Param('id') id: string) {
    return this.tradingService.findTradingHistoryById(id);
  }

  @Get('history/symbol/:symbol')
  async findTradingHistoryBySymbol(@Param('symbol') symbol: string) {
    return this.tradingService.findTradingHistoryBySymbol(symbol);
  }

  @Get('history/status/:status')
  async findTradingHistoryByStatus(@Param('status') status: string) {
    // Convert string status to OrderStatus enum
    return this.tradingService.findTradingHistoryByStatus(status as OrderStatus);
  }

  @Put('history/:id/status/:status')
  async updateTradingHistoryStatus(
    @Param('id') id: string,
    @Param('status') status: string,
  ) {
    // Convert string status to OrderStatus enum
    const orderStatus = status as unknown as OrderStatus;
    return this.tradingService.updateTradingHistoryStatus(id, orderStatus);
  }
}
