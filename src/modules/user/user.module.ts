import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { CodeEntity } from './entities/code.entity';
import { EmailModule } from '../email/email.module';
import { UserController } from './user.controller';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    EmailModule,
    TypeOrmModule.forFeature([UserEntity, CodeEntity]),
    FileModule,
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
