import { IsOptional } from 'class-validator';

export class setPfp {
  @IsOptional()
  image: Express.Multer.File;
}
