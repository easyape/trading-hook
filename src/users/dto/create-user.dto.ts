import { IsString, IsNotEmpty, MinLength, IsOptional, Matches, IsMobilePhone } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Mobile number is required' })
  @IsMobilePhone(undefined, {}, { message: 'Invalid mobile number format' })
  mobileNumber: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name?: string;
}
