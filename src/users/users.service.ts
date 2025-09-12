import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateExchangeInfoDto } from './dto/update-exchange-info.dto';
import { BalanceService } from '../balance/balance.service';
import { EncryptionService } from '../utils/encryption.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
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

  /**
   * Updates a user's exchange information with encrypted API credentials
   * @param userId The ID of the user to update
   * @param exchangeInfoDto The exchange information to update
   * @returns The updated user information (without decrypted credentials)
   */
  async updateExchangeInfo(userId: string, exchangeInfoDto: UpdateExchangeInfoDto) {
    // Verify user exists
    const user = await this.findById(userId);

    // Encrypt sensitive data
    const encryptedApiKey = this.encryptionService.encrypt(
      exchangeInfoDto.apiKey,
      userId
    );
    
    const encryptedApiSecret = this.encryptionService.encrypt(
      exchangeInfoDto.apiSecret,
      userId
    );

    // Prepare update data
    const updateData: any = {
      exchangeName: exchangeInfoDto.exchangeName,
      apiKey: encryptedApiKey,
      apiSecret: encryptedApiSecret,
    };

    // Add passPhase if provided
    if (exchangeInfoDto.passPhase) {
      updateData.passPhase = this.encryptionService.encrypt(
        exchangeInfoDto.passPhase,
        userId
      );
    }

    // Update user in database
    const updatedUser = await this.prisma.userInfo.update({
      where: { id: userId },
      data: updateData,
    });

    return updatedUser;
  }

  /**
   * Gets a user's decrypted exchange API credentials
   * @param userId The ID of the user
   * @returns The decrypted API credentials
   */
  async getDecryptedExchangeInfo(userId: string) {
    const user = await this.findById(userId);
    
    // If user doesn't have exchange info set, return null
    if (!user.apiKey || !user.apiSecret || !user.exchangeName) {
      return null;
    }

    // Decrypt the credentials
    const decryptedInfo = {
      exchangeName: user.exchangeName,
      apiKey: this.encryptionService.decrypt(user.apiKey, userId),
      apiSecret: this.encryptionService.decrypt(user.apiSecret, userId),
    };

    // Add passPhase if it exists
    if (user.passPhase) {
      decryptedInfo['passPhase'] = this.encryptionService.decrypt(user.passPhase, userId);
    }

    return decryptedInfo;
  }
}
