import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { BaseDto } from 'src/base/dto/base.dto.';
export class CreateIdeaDto extends BaseDto {
  @IsOptional()
  image: Express.Multer.File;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @IsOptional()
  @IsString()
  usefulLink: string;
}
