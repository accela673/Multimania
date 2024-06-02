import { IsOptional, IsString, MaxLength } from 'class-validator';
import { BaseDto } from 'src/base/dto/base.dto.';

export class EditIdeaDto extends BaseDto {
  @IsOptional()
  image: Express.Multer.File;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description: string;

  @IsOptional()
  @IsString()
  usefulLink: string;
}
