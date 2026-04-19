import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  index: number;

  @Column({ type: 'varchar', length: 100 })
  timestamp: string;

  @Column({ type: 'text' })
  data: string;

  @Column({ type: 'varchar', length: 255 })
  previousHash: string;

  @Column({ type: 'varchar', length: 255 })
  hash: string;

  @Column({ default: 0 })
  nonce: number;

  @Column({ default: 2 })
  difficulty: number;

  @CreateDateColumn()
  createdAt: Date;
}