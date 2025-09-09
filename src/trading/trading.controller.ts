import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { TradingService } from './trading.service';
import { CreateTradingHistoryDto } from './dto/create-trading-history.dto';
import { OrderStatus } from './enums/trading.enums';

@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Post('history')
  async createTradingHistory(@Body() createTradingHistoryDto: CreateTradingHistoryDto) {
    return this.tradingService.createTradingHistory(createTradingHistoryDto);
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
