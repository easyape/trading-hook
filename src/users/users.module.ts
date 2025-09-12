import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BalanceModule } from '../balance/balance.module';
import { EncryptionService } from '../utils/encryption.service';

@Module({
  imports: [PrismaModule, forwardRef(() => BalanceModule), ConfigModule],
  controllers: [UsersController],
  providers: [UsersService, EncryptionService],
  exports: [UsersService],
})
export class UsersModule {}
