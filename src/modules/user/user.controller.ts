import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { setPfp } from './dto/set-pfp.dto';
import { EditUserDto } from './dto/edit.profile.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiTags('Пользователи')
  @ApiOperation({ summary: 'Get list of all users' })
  @Get()
  async getAll() {
    return await this.userService.getAllUsers();
  }

  @ApiTags('Пользователи')
  @ApiOperation({ summary: 'Get one user by id' })
  @Get(':id')
  async getById(@Param('id') id: number) {
    return await this.userService.get(id);
  }

  @ApiTags('Пользователи')
  @ApiOperation({ summary: 'Delete user by id' })
  @Delete(':id')
  async deleteById(@Param('id') id: number) {
    return await this.userService.deleteUser(id);
  }

  @ApiTags('Профиль пользователя')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @Get('get/profile')
  async getProfile(@Req() req) {
    return await this.userService.findById(+req.user.id);
  }

  @ApiTags('Профиль пользователя')
  @ApiOperation({ summary: 'Изменить фото профиля' })
  @Patch('change/pfp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  @Patch('pfp/set')
  async setPfp(@Req() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File not found');
    }
    return await this.userService.setPfp(file, +req.user.id);
  }

  @ApiTags('Профиль пользователя')
  @ApiOperation({ summary: 'Изменить данные профиля' })
  @Patch('edit/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async editProfile(@Req() req, @Body() body: EditUserDto) {
    return await this.userService.editUser(body, +req.user.id);
  }

  @ApiTags('Профиль пользователя')
  @ApiOperation({ summary: 'Изменить тему профиля' })
  @Patch('edit/profile/:theme')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async editProfileTheme(@Req() req, @Param('theme') name: string) {
    return await this.userService.changeTheme(+req.user.id, name);
  }
}
