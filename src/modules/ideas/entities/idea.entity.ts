import { BaseEntity } from 'src/base/base.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class IdeaEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  imageUrl: string;

  @Column()
  usefulLink: string;

  @Column({nullable: true})
  firstLink: string;

  @Column({nullable:true,default:null})
  secondLink: string;

  @Column({nullable:true, default:null})
  thirdLink: string;

  @Column({ nullable: true })
  lastEdited: Date;

  @OneToMany(() => UserEntity, (user) => user.startups, {
    cascade: true,
  })
  members: UserEntity[];

  @OneToMany(() => UserEntity, (user) => user.pendingRequests, {
    cascade: true,
  })
  requests: UserEntity[];

  @ManyToOne(() => UserEntity, (user) => user.ideas, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  author: UserEntity;
}
