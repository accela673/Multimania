import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Image extends BaseEntity {
  @Column()
  url: string;

  @Column()
  publicId: string;
}
