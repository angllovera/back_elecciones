import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { Candidate } from '../candidates/entities/candidate.entity';
import { User } from '../users/entities/user.entity';
import { Vote } from './entities/vote.entity';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote, User, Candidate]),
    BlockchainModule,
  ],
  controllers: [VotesController],
  providers: [VotesService],
})
export class VotesModule {}
