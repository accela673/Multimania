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
import { InsertLinkDto } from './dto/insert-link.dto';

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
    const idea = await this.ideaService.getIdea(+id);
    delete idea.requests;
    return idea;
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

  @ApiTags('Мои стартапы')
  @ApiOperation({ summary: 'Вставить ссылку в прогресс' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('insert/link/to/progress/:teamId/numberOfLink')
  async insertLink(
    @Param('teamId') teamId: string,
    @Param('numberOfLink') numberOfLink: string,
    @Req() req,
    @Body() insertLinkDto:InsertLinkDto
  ) {
    return await this.ideaService.insertLink(
      +req.user.id,
      insertLinkDto,
      +teamId,
      +numberOfLink
    );
  }

  @ApiTags('Заявки на вступление в мою команду')
  @ApiOperation({ summary: 'Получить список заявок на мой стартап' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('get/requests/to/:teamId')
  async getRequests(@Param('teamId') teamId: string, @Req() req) {
    const userId = Number(req.user.id);
    const parsedTeamId = Number(teamId);

    if (isNaN(userId)) {
      console.log(`User id: ${req.user.id} is have to be number`);
      throw new BadRequestException(`User id: ${req.user.id} is have to be number`);
    }
    if (isNaN(parsedTeamId)) {
      console.log(`Team id: ${teamId} is have to be number`);
      throw new BadRequestException(`Team id: ${teamId} is have to be number`);

    }
    return await this.ideaService.getRequests(userId, parsedTeamId);
  }

  @ApiTags('Заявки на вступление в мою команду')
  @ApiOperation({ summary: 'Отклонить определенную заявку на стартап' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('decline/request/to/team/:userId/:teamId')
  async declineRequest(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Req() req,
  ) {
    return await this.ideaService.declineRequest(
      +userId,
      +req.user.id,
      +teamId,
    );
  }

  @ApiTags('Заявки на вступление в мою команду')
  @ApiOperation({ summary: 'Принять определенную заявку на стартап' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('approve/request/to/team/:userId/:teamId')
  async approveRequest(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Req() req,
  ) {
    return await this.ideaService.addToTeam(+userId, +req.user.id, +teamId);
  }

  @ApiTags('Вступление в команды')
  @ApiOperation({ summary: 'Подать заявку на вступление на стартап' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('apply/to/team/:id')
  async applyToStartup(@Param('id') teamId: string, @Req() req) {
    return await this.ideaService.applyToTeam(+req.user.id, +teamId);
  }

  @ApiTags('Вступление в команды')
  @ApiOperation({ summary: 'Выйти из стартапа' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('leave/team/:id')
  async leaveStartUp(@Param('id') teamId: string, @Req() req) {
    return await this.ideaService.leaveTeam(+req.user.id, +teamId);
  }
}
