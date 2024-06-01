import { BadRequestException, Injectable } from '@nestjs/common';
import { IdeaEntity } from './entities/idea.entity';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UserService } from '../user/services/user.service';
import { FileService } from '../file/file.service';
import { EditIdeaDto } from './dto/edit-idea.dto';

@Injectable()
export class IdeaService extends BaseService<IdeaEntity> {
  constructor(
    @InjectRepository(IdeaEntity)
    private readonly ideaRepository: Repository<IdeaEntity>,
    private userService: UserService,
    private fileService: FileService,
  ) {
    super(ideaRepository);
  }

  async listIdeas() {
    return await this.ideaRepository.find();
  }

  async getIdea(id: number) {
    let idea = await this.ideaRepository.findOne({ where: { id: id } });
    await this.checkIfExcist(idea, 'idea', id);
    idea = await this.ideaRepository.findOne({
      where: { id: id },
      relations: ['author', 'members'],
    });
    await this.clearPrivateData(idea.author);
    for (let i = 0; i < idea.members.length; i++) {
      await this.clearPrivateData(idea.members[i]);
    }
    return idea;
  }

  async createIdea(dto: CreateIdeaDto, userId: number) {
    const idea = await this.ideaRepository.create();
    idea.usefulLink = dto.usefulLink;
    idea.name = dto.name;
    idea.description = dto.description;
    if (dto.image) {
      const image = await this.fileService.createImage(dto.image);
      idea.imageUrl = image.url;
    }
    const user = await this.userService.findById(userId);
    user.ideas.push(idea);
    await this.userService.saveUser(user);
    return await this.ideaRepository.save(idea);
  }

  async deleteAny(id: number) {
    const idea = await this.getIdea(id);
    return await this.ideaRepository.remove(idea);
  }

  async deleteIdea(ideaId: number, userId: number) {
    const idea = await this.getIdea(ideaId);
    if (idea.author.id !== userId) {
      throw new BadRequestException('Incorrect user');
    }
    return await this.ideaRepository.remove(idea);
  }

  async listMy(userId: number) {
    const user = await this.userService.findById(userId);
    return user.ideas;
  }

  async editIdea(ideaId: number, dto: EditIdeaDto, userId: number) {
    const idea = await this.ideaRepository.findOne({
      where: { id: ideaId, author: { id: userId } },
      relations: ['author'],
    });
    if (dto.image) {
      const image = await this.fileService.createImage(dto.image);
      idea.imageUrl = image.url;
    }
    delete dto.image;
    Object.assign(idea, dto);
    return await this.ideaRepository.save(idea);
  }
}
