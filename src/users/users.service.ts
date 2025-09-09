import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BalanceService } from '../balance/balance.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => BalanceService))
    private balanceService?: BalanceService
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user with the mobile number already exists
    const existingUser = await this.prisma.userInfo.findUnique({
      where: { mobileNumber: createUserDto.mobileNumber },
    });

    if (existingUser) {
      throw new ConflictException('User with this mobile number already exists');
    }

    // Create new user
    const newUser = await this.prisma.userInfo.create({
      data: createUserDto,
    });

    // Initialize user balance if BalanceService is available
    if (this.balanceService) {
      await this.balanceService.initializeBalance(newUser.id);
    }

    return newUser;
  }

  async findByMobileNumber(mobileNumber: string) {
    const user = await this.prisma.userInfo.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      throw new NotFoundException(`User with mobile number ${mobileNumber} not found`);
    }

    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.userInfo.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }



  async validateUser(mobileNumber: string, password: string) {
    try {
      const user = await this.findByMobileNumber(mobileNumber);
      
      if (user && user.password === password) {
        return user;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
}
