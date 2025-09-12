import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ExchangeName } from '@prisma/client';

export class UpdateExchangeInfoDto {
  @IsNotEmpty({ message: 'Exchange name is required' })
  @IsEnum(ExchangeName, { message: 'Invalid exchange name' })
  exchangeName: ExchangeName;

  @IsNotEmpty({ message: 'API key is required' })
  @IsString()
  apiKey: string;

  @IsNotEmpty({ message: 'API secret is required' })
  @IsString()
  apiSecret: string;

  @IsOptional()
  @IsString()
  passPhase?: string;
}
