import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTradingHistoryDto } from './dto/create-trading-history.dto';
import { OrderStatus } from './enums/trading.enums';

@Injectable()
export class TradingService {
  constructor(private prisma: PrismaService) {}

  async createTradingHistory(createTradingHistoryDto: CreateTradingHistoryDto) {
    return this.prisma.tradingHistory.create({
      data: createTradingHistoryDto,
    });
  }

  async findAllTradingHistory() {
    return this.prisma.tradingHistory.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findUserTradingHistory(userId: string) {
    return this.prisma.tradingHistory.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findTradingHistoryById(id: string) {
    return this.prisma.tradingHistory.findUnique({
      where: {
        id,
      },
    });
  }

  async findTradingHistoryBySymbol(symbol: string) {
    return this.prisma.tradingHistory.findMany({
      where: {
        symbol,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findTradingHistoryByStatus(status: OrderStatus) {
    return this.prisma.tradingHistory.findMany({
      where: {
        status,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateTradingHistoryStatus(id: string, status: OrderStatus) {
    return this.prisma.tradingHistory.update({
      where: {
        id,
      },
      data: {
        status,
        ...(status === OrderStatus.COMPLETED ? { completedAt: new Date() } : {}),
      },
    });
  }
}
