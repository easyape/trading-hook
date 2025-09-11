// Import our custom enum types
import { ExchangeName, OrderSide, OrderStatus, OrderType } from "@prisma/client";
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsDate } from 'class-validator';

export class CreateTradingDto {
  @IsNotEmpty({ message: 'userId is required' })
  @IsString()
  userId: string;

  @IsNotEmpty({ message: 'symbol is required' })
  @IsString()
  symbol: string;

  @IsEnum(OrderType)
  orderType: OrderType;

  @IsNotEmpty({ message: 'side is required' })
  @IsEnum(OrderSide)
  side: OrderSide;

  @IsNumber()
  price: number;

  @IsNotEmpty({ message: 'amount is required' })
  @IsNumber()
  amount: number;

  @IsNumber()
  fee: number;

  @IsNumber()
  totalValue: number;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  exchangeId?: string;

  @IsNotEmpty({ message: 'exchangeName is required' })
  @IsEnum(ExchangeName)
  exchangeName: ExchangeName;

  @IsOptional()
  @IsDate()
  completedAt?: Date;
}
