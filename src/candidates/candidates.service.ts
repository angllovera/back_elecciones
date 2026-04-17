import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { Candidate } from './entities/candidate.entity';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  async create(createCandidateDto: CreateCandidateDto) {
    const { nombre, partido, fotoUrl } = createCandidateDto;

    const existingCandidate = await this.candidateRepository.findOne({
      where: { nombre, partido },
    });

    if (existingCandidate) {
      throw new BadRequestException('Ese candidato ya fue registrado');
    }

    const candidate = this.candidateRepository.create({
      nombre,
      partido,
      fotoUrl: fotoUrl ?? null,
      activo: true,
    });

    const savedCandidate = await this.candidateRepository.save(candidate);

    return {
      message: 'Candidato registrado correctamente',
      candidate: savedCandidate,
    };
  }

  async findAll() {
    return this.candidateRepository.find({
      order: { id: 'DESC' },
    });
  }
}