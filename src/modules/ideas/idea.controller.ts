import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IdeaService } from './idea.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { EditIdeaDto } from './dto/edit-idea.dto';

@Controller('ideas')
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @ApiTags('Стартапы')
  @ApiOperation({ summary: 'Вывести все стартапы' })
  @Get()
  async getIdeas() {
    return await this.ideaService.listIdeas();
  }

  @ApiTags('Стартапы')
  @ApiOperation({ summary: 'Найти стартап' })
  @Get(':id')
  async getIdeaById(@Param('id') id: string) {
    return await this.ideaService.getIdea(+id);
  }

  @ApiTags('Стартапы')
  @ApiOperation({ summary: 'Удалить любой стартап' })
  @Delete(':id')
  async deleteAnyIdea(@Param('id') id: string) {
    return await this.ideaService.deleteAny(+id);
  }

  @ApiTags('Мои стартапы')
  @ApiOperation({ summary: 'Список моих стартапов' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('all/my')
  async getMyStartUps(@Req() req) {
    return await this.ideaService.listMy(req.user.id);
  }

  @ApiTags('Мои стартапы')
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать стартап' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Сайт для туризма' },
        description: {
          type: 'string',
          example:
            'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod dolore magna aliquam erat volutpat.',
        },
        usefulLink: { type: 'string', example: 'Полезная ссылка' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async createIdea(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateIdeaDto,
  ) {
    if (!file) {
      throw new BadRequestException('File not found');
    }
    dto.image = file;
    return await this.ideaService.createIdea(dto, +req.user.id);
  }

  @ApiTags('Мои стартапы')
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Редактировать стартап' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Новое название', nullable: true },
        description: {
          type: 'string',
          example:
            'Lorem adipiscing elit, sed diam nonummy nibh euismod dolore magna aliquam erat volutpat.',
          nullable: true,
        },
        usefulLink: { type: 'string', example: 'Новая ссылка', nullable: true },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async editeIdea(
    @Param('id') id: string,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: EditIdeaDto,
  ) {
    dto.image = file;
    return await this.ideaService.editIdea(+id, dto, +req.user.id);
  }

  @ApiTags('Мои стартапы')
  @ApiOperation({ summary: 'Удалить свой стартап' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('my/:id')
  async deleteIdea(@Param('id') id: string, @Req() req) {
    return await this.ideaService.deleteIdea(+id, req.user.id);
  }
}
