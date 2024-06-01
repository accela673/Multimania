import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { UserRole } from '../enums/roles.enum';
import { IdeaEntity } from 'src/modules/ideas/entities/idea.entity';

@Entity()
export class UserEntity extends BaseEntity {
  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  pfp: string;

  @Column({ nullable: true })
  confirmCodeId: number;

  @Column({ nullable: true })
  passwordRecoveryCodeId: number;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => IdeaEntity, (idea) => idea.author, {
    cascade: true,
  })
  ideas: IdeaEntity[];

  @ManyToOne(() => IdeaEntity, (idea) => idea.members, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  startups: IdeaEntity;

  @ManyToOne(() => IdeaEntity, (idea) => idea.requests, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  pendingRequests: IdeaEntity;
}
