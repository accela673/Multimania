import { Module } from '@nestjs/common';
import { IdeaController } from './idea.controller';
import { IdeaService } from './idea.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { IdeaEntity } from './entities/idea.entity';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, IdeaEntity]),
    UserModule,
    FileModule,
  ],
  controllers: [IdeaController],
  providers: [IdeaService],
})
export class IdeaModule {}
