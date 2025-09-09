import { Controller, Get, Put, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { UpdateBalanceDto } from './dto/update-balance.dto';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get(':userId')
  async getUserBalance(@Param('userId') userId: string) {
    return this.balanceService.getUserBalance(userId);
  }

  @Put(':userId')
  @HttpCode(HttpStatus.OK)
  async updateBalance(
    @Param('userId') userId: string,
    @Body() updateBalanceDto: UpdateBalanceDto,
  ) {
    return this.balanceService.updateBalance(userId, updateBalanceDto);
  }

  @Post(':userId/add-usdt')
  @HttpCode(HttpStatus.OK)
  async addUsdtBalance(
    @Param('userId') userId: string,
    @Body() body: { amount: number },
  ) {
    return this.balanceService.addUsdtBalance(userId, body.amount);
  }

  @Post(':userId/transfer-to-gas')
  @HttpCode(HttpStatus.OK)
  async transferUsdtToGas(
    @Param('userId') userId: string,
    @Body() body: { amount: number },
  ) {
    return this.balanceService.transferUsdtToGas(userId, body.amount);
  }

  @Post(':userId/update-profit')
  @HttpCode(HttpStatus.OK)
  async updateProfit(
    @Param('userId') userId: string,
    @Body() body: { profit: number, isIncrement?: boolean },
  ) {
    return this.balanceService.updateProfit(userId, body.profit, body.isIncrement);
  }
}
