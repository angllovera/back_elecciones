import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Candidate } from './candidates/entities/candidate.entity';
import { CandidatesModule } from './candidates/candidates.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { Vote } from './votes/entities/vote.entity';
import { VotesModule } from './votes/votes.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '12345678',
      database: 'elecciones',
      entities: [User, Candidate, Vote],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CandidatesModule,
    VotesModule,
  ],
})
export class AppModule {}