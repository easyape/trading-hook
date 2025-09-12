import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateExchangeInfoDto } from './dto/update-exchange-info.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('mobile/:mobileNumber')
  async findByMobileNumber(@Param('mobileNumber') mobileNumber: string) {
    return this.usersService.findByMobileNumber(mobileNumber);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post(':id/exchange-info')
  async updateExchangeInfo(
    @Param('id') id: string,
    @Body() updateExchangeInfoDto: UpdateExchangeInfoDto,
  ) {
    return this.usersService.updateExchangeInfo(id, updateExchangeInfoDto);
  }

  @Get(':id/exchange-info')
  async getExchangeInfo(@Param('id') id: string) {
    return this.usersService.getDecryptedExchangeInfo(id);
  }
}
