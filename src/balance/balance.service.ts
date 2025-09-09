import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { UpdateBalanceDto } from './dto/update-balance.dto';

@Injectable()
export class BalanceService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async initializeBalance(userId: string) {
    return this.prisma.userBalance.create({
      data: {
        userId,
        usdtBalance: 0,
        gasBalance: 0,
        profit: 0,
      },
    });
  }

  async getUserBalance(userId: string) {
    // Verify user exists
    await this.usersService.findById(userId);

    const balance = await this.prisma.userBalance.findFirst({
      where: { userId },
    });

    if (!balance) {
      throw new NotFoundException(`Balance for user with ID ${userId} not found`);
    }

    return balance;
  }

  async updateBalance(userId: string, updateBalanceDto: UpdateBalanceDto) {
    // Check if user exists
    await this.usersService.findById(userId);

    // Find user balance
    const balance = await this.prisma.userBalance.findFirst({
      where: { userId },
    });

    if (!balance) {
      // Create balance if it doesn't exist
      return this.prisma.userBalance.create({
        data: {
          userId,
          usdtBalance: updateBalanceDto.usdtBalance ?? 0,
          gasBalance: updateBalanceDto.gasBalance ?? 0,
          profit: updateBalanceDto.profit ?? 0,
        },
      });
    }

    // Prepare update data with only the fields that are provided
    const updateData: any = {};
    
    if (updateBalanceDto.usdtBalance !== undefined) {
      updateData.usdtBalance = updateBalanceDto.usdtBalance;
    }
    
    if (updateBalanceDto.gasBalance !== undefined) {
      updateData.gasBalance = updateBalanceDto.gasBalance;
    }
    
    if (updateBalanceDto.profit !== undefined) {
      updateData.profit = updateBalanceDto.profit;
    }

    // Update balance
    return this.prisma.userBalance.update({
      where: { id: balance.id },
      data: updateData,
    });
  }

  /**
   * Add to user's USDT balance
   * @param userId User ID
   * @param amount Amount to add (must be positive)
   * @returns Updated balance
   */
  async addUsdtBalance(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    // Find user balance
    const balance = await this.prisma.userBalance.findFirst({
      where: { userId },
    });

    if (!balance) {
      // Create balance if it doesn't exist
      return this.prisma.userBalance.create({
        data: {
          userId,
          usdtBalance: amount,
          gasBalance: 0,
          profit: 0,
        },
      });
    }

    // Update balance by adding the amount
    return this.prisma.userBalance.update({
      where: { id: balance.id },
      data: {
        usdtBalance: { increment: amount },
      },
    });
  }

  /**
   * Transfer from USDT balance to gas balance
   * @param userId User ID
   * @param amount Amount to transfer (must be positive and not exceed USDT balance)
   * @returns Updated balance
   */
  async transferUsdtToGas(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    // Find user balance
    const balance = await this.prisma.userBalance.findFirst({
      where: { userId },
    });

    if (!balance) {
      throw new NotFoundException(`Balance for user with ID ${userId} not found`);
    }

    // Check if user has enough USDT balance
    if (Number(balance.usdtBalance) < amount) {
      throw new BadRequestException('Insufficient USDT balance');
    }

    // Update balance by transferring from USDT to gas
    return this.prisma.userBalance.update({
      where: { id: balance.id },
      data: {
        usdtBalance: { decrement: amount },
        gasBalance: { increment: amount },
      },
    });
  }

  /**
   * Update user's profit
   * @param userId User ID
   * @param profit New profit value or amount to add/subtract (can be negative to reduce profit)
   * @param isIncrement If true, add to existing profit; if false, set as new value
   * @returns Updated balance
   */
  async updateProfit(userId: string, profit: number, isIncrement: boolean = false) {
    // Check if user exists
    await this.usersService.findById(userId);

    // Find user balance
    const balance = await this.prisma.userBalance.findFirst({
      where: { userId },
    });

    if (!balance) {
      // Create balance if it doesn't exist
      return this.prisma.userBalance.create({
        data: {
          userId,
          usdtBalance: 0,
          gasBalance: 0,
          profit: profit,
        },
      });
    }

    // Calculate new profit value
    // When isIncrement is true, we add the profit value (which can be negative to reduce profit)
    // When isIncrement is false, we set the profit to the new value directly
    
    // Update balance with new profit
    return this.prisma.userBalance.update({
      where: { id: balance.id },
      data: {
        profit: isIncrement ? { increment: profit } : profit,
      },
    });
  }
}
