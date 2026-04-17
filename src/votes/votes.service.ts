import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Candidate } from '../candidates/entities/candidate.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { Repository } from 'typeorm';
import { CreateVoteDto } from './dto/create-vote.dto';
import { Vote } from './entities/vote.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  async createVote(userId: number, createVoteDto: CreateVoteDto) {
    const { candidateId } = createVoteDto;

    const voter = await this.userRepository.findOne({
      where: { id: userId, role: Role.VOTANTE, activo: true },
    });

    if (!voter) {
      throw new NotFoundException('Votante no encontrado');
    }

    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, activo: true },
    });

    if (!candidate) {
      throw new NotFoundException('Candidato no encontrado');
    }

    const existingVote = await this.voteRepository.findOne({
      where: {
        voter: { id: voter.id },
      },
      relations: ['voter'],
    });

    if (existingVote) {
      throw new BadRequestException('El votante ya emitió su voto');
    }

    const vote = this.voteRepository.create({
      voter,
      candidate,
    });

    const savedVote = await this.voteRepository.save(vote);

    return {
      message: 'Voto registrado correctamente',
      vote: {
        id: savedVote.id,
        voterId: savedVote.voter.id,
        candidateId: savedVote.candidate.id,
        createdAt: savedVote.createdAt,
      },
    };
  }

  async getMyVote(userId: number) {
    const vote = await this.voteRepository.findOne({
      where: {
        voter: { id: userId },
      },
      relations: ['voter', 'candidate'],
    });

    if (!vote) {
      return {
        hasVote: false,
        vote: null,
      };
    }

    return {
      hasVote: true,
      vote: {
        id: vote.id,
        candidate: {
          id: vote.candidate.id,
          nombre: vote.candidate.nombre,
          partido: vote.candidate.partido,
          fotoUrl: vote.candidate.fotoUrl,
        },
        createdAt: vote.createdAt,
      },
    };
  }

  async getResults() {
    const votes = await this.voteRepository.find({
      relations: ['candidate'],
    });

    const resultsMap = new Map<
      number,
      {
        candidateId: number;
        nombre: string;
        partido: string;
        totalVotes: number;
      }
    >();

    for (const vote of votes) {
      const candidateId = vote.candidate.id;

      if (!resultsMap.has(candidateId)) {
        resultsMap.set(candidateId, {
          candidateId,
          nombre: vote.candidate.nombre,
          partido: vote.candidate.partido,
          totalVotes: 0,
        });
      }

      const current = resultsMap.get(candidateId)!;
      current.totalVotes += 1;
    }

    return Array.from(resultsMap.values()).sort(
      (a, b) => b.totalVotes - a.totalVotes,
    );
  }
}