import { Candidate } from '../../candidates/entities/candidate.entity';
import { User } from '../../users/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('votes')
@Unique(['voter'])
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'voterId' })
  voter: User;

  @ManyToOne(() => Candidate, { eager: true, nullable: false })
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @CreateDateColumn()
  createdAt: Date;
}