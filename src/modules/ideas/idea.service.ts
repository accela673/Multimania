import { BadRequestException, Injectable } from '@nestjs/common';
import { IdeaEntity } from './entities/idea.entity';
import { BaseService } from 'src/base/base.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UserService } from '../user/services/user.service';
import { FileService } from '../file/file.service';
import { EditIdeaDto } from './dto/edit-idea.dto';
import { UserEntity } from '../user/entities/user.entity';
import { InsertLinkDto } from './dto/insert-link.dto';

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
    return await this.ideaRepository.find({ relations: ['author', 'members'] });
  }

  async getIdea(id: number) {
    let idea = await this.ideaRepository.findOne({ where: { id: id } });
    await this.checkIfExcist(idea, 'idea', id);
    idea = await this.ideaRepository.findOne({
      where: { id: id },
      relations: ['author', 'members', 'requests'],
    });
    await this.clearPrivateData(idea.author);
    for (let i = 0; i < idea.members.length; i++) {
      await this.clearPrivateData(idea.members[i]);
    }
    return idea;
  }

  async createIdea(dto: CreateIdeaDto, userId: number) {
    const user = await this.userService.findById(userId);
    await this.checkTimeLimit(user.starupTimeLimit, 12);
    const idea = await this.ideaRepository.create();
    idea.usefulLink = dto.usefulLink;
    idea.name = dto.name;
    idea.description = dto.description;
    if (dto.image) {
      const image = await this.fileService.createImage(dto.image);
      idea.imageUrl = image.url;
    }
    user.starupTimeLimit = new Date();
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
    await this.checkTimeLimit(idea.lastEdited, 12);
    if (dto.image) {
      const image = await this.fileService.createImage(dto.image);
      idea.imageUrl = image.url;
    }
    delete dto.image;
    idea.lastEdited = new Date();
    Object.assign(idea, dto);
    return await this.ideaRepository.save(idea);
  }

  async getRequests(userId: number, ideaId: number) {
    const user = await this.userService.findById(userId);
    const team = await this.getIdea(ideaId);
    if (team.author.id !== user.id) {
      throw new BadRequestException('You are not the author');
    }
    for (let i = 0; i < team.requests.length; i++) {
      await this.clearPrivateData(team.requests[i]);
    }
    return team.requests;
  }

  async applyToTeam(userId: number, teamId: number) {
    const user = await this.userService.findById(userId);
    const team = await this.getIdea(teamId);
    if (team.author.id === user.id) {
      throw new BadRequestException('You are the author');
    }
    await this.checkIfInTeam(team, user);
    team.requests.push(user);
    await this.ideaRepository.save(team);
    return { message: 'Success!' };
  }

  private async checkIfInTeam(team: IdeaEntity, user: UserEntity) {
    let hasInTeam = false;
    for (let i = 0; i < team.members.length; i++) {
      if (team.members[i].id === user.id) {
        hasInTeam = true;
      }
    }
    if (hasInTeam) {
      throw new BadRequestException('You are already in team');
    }
  }

  private async checkIfInReq(team: IdeaEntity, user: UserEntity) {
    let hasInRequests = false;
    for (let i = 0; i < team.requests.length; i++) {
      if (team.requests[i].id === user.id) {
        hasInRequests = true;
      }
    }
    if (!hasInRequests) {
      throw new BadRequestException('User not found in requests');
    }
  }

  async addToTeam(userId: number, authorId: number, teamId: number) {
    const user = await this.userService.findById(userId);
    const team = await this.getIdea(teamId);
    if (team.author.id !== authorId) {
      throw new BadRequestException('You are not the author');
    }
    if (team.author.id === user.id) {
      throw new BadRequestException('You are the author');
    }
    await this.checkIfInTeam(team, user);
    await this.checkIfInReq(team, user);
    team.members.push(user);
    await this.ideaRepository.save(team);
    return { message: 'Success!' };
  }

  async declineRequest(userId: number, authorId: number, teamId: number) {
    const user = await this.userService.findById(userId);
    const team = await this.getIdea(teamId);
    if (team.author.id !== authorId) {
      throw new BadRequestException('You are not the author');
    }
    if (team.author.id === user.id) {
      throw new BadRequestException('You are the author');
    }
    await this.checkIfInTeam(team, user);
    await this.checkIfInReq(team, user);
    team.requests.splice(team.requests.indexOf(user));
    await this.ideaRepository.save(team);
    return { message: 'Success!' };
  }

  async insertLink(userId: number, dto: InsertLinkDto, teamId: number, numberOfLink: number){
    const team = await this.getIdea(teamId)
    if(team.author.id!==userId){
        throw new BadRequestException('You are not the author')
      }
    switch (numberOfLink) {
      case 1:
        team.firstLink = dto.link;
        break;
      case 2:
        team.secondLink = dto.link;
        break;
      case 3:
        team.thirdLink = dto.link;
        break;
      default:
        throw new BadRequestException('Invalid link number');
      }
    await this.ideaRepository.save(team) 
    return {message: "Success!"}
  }
}
