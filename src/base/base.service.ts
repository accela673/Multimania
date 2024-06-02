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

  async checkTimeLimit(date: Date, limitInHours: number) {
    // if (!date) {
    //   return;
    // }
    // const currentDate = new Date();
    // if (!(date instanceof Date)) {
    //   date = new Date(date);
    // }
    // if (isNaN(date.getTime())) {
    //   throw new Error('Invalid date');
    // }

    // const timeDifference = currentDate.getTime() - date.getTime();
    // const hoursDifference = timeDifference / (1000 * 60 * 60);

    // if (hoursDifference <= limitInHours) {
    //   const remainingMinutes = (limitInHours - hoursDifference) * 60;
    //   throw new BadRequestException(
    //     `Remaining time to use this feature: ${Math.floor(
    //       remainingMinutes,
    //     )} minutes`,
    //   );
    // }
    return;
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
    delete user.editProfileTimeLimit;
    delete user.starupTimeLimit;
    delete user.changePfpTimeLimit;
    delete user.colorTheme;
    return user;
  }

  async checkIfExcist(obj: any, name: string, id: any) {
    if (!obj) {
      throw new BadRequestException(
        `Поле ${name} С id ${id} не найдено в базе данных`,
      );
    }
  }
}
