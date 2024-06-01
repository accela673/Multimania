import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { BaseDto } from 'src/base/dto/base.dto.';

export class EditUserDto extends BaseDto {
  @ApiProperty({ example: 'Tyler' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Durden' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName: string;

  @IsOptional()
  @ApiProperty({ example: 'https://www.linkedin.com/' })
  @IsUrl()
  usefulLink: string;
}
