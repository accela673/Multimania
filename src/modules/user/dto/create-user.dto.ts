import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BaseDto } from 'src/base/dto/base.dto.';

export class CreateUserDto extends BaseDto {
  @ApiProperty({ example: 'Ryan' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Gosling' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: 'sardarkasmaliev@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'your_password' })
  @IsString()
  @MaxLength(25)
  @MinLength(6) // Минимальная длина пароля
  password: string;
}
