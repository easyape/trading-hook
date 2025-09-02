import { Module } from '@nestjs/common';
import { ExchangeController, ExchangeService } from './exchange';

@Module({
  controllers: [ExchangeController],
  providers: [ExchangeService],
  exports: [ExchangeService],
})
export class ApiModule {}
