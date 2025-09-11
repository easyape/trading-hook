import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TradingModule } from './trading/trading.module';
import { BalanceModule } from './balance/balance.module';
import { TimeTaskModule } from './timetask/timetask.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    TradingModule,
    BalanceModule,
    TimeTaskModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
