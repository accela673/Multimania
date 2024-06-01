import { Repository } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BadRequestException } from '@nestjs/common';
import { UserEntity } from 'src/modules/user/entities/user.entity';

export abstract class BaseService<T extends BaseEntity> {
  repository: Repository<T>;

  protected constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  async get(id: number): Promise<T | null> {
    return this.repository
      .createQueryBuilder()
      .where('id = :id', { id })
      .getOne();
  }

  async getWithRelations(id: number, entity: string, relations?: string[]) {
    const query = this.repository
      .createQueryBuilder(entity)
      .where(`${entity}.id = :id`, { id })
      .andWhere(`${entity}.isDeleted != true`);

    if (relations) {
      for (const relation of relations) {
        query.leftJoinAndSelect(`${entity}.${relation}`, `${relation}`);
      }
    }

    return await query.getOne();
  }

  async clearPrivateData(user: UserEntity) {
    delete user.password;
    delete user.passwordRecoveryCodeId;
    delete user.confirmCodeId;
    delete user.isConfirmed;
    delete user.role;
    delete user.createdAt;
  }

  async checkIfExcist(obj: any, name: string, id: any) {
    if (!obj) {
      throw new BadRequestException(
        `Поле ${name} С id ${id} не найдено в базе данных`,
      );
    }
  }
}
