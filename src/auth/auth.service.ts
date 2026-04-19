import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { CreateVoterDto } from './dto/create-voter.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { LoginVoterDto } from './dto/login-voter.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async registerAdmin(registerAdminDto: RegisterAdminDto) {
    const { nombres, apellidos, email, password } = registerAdminDto;

    const existingAdmin = await this.userRepository.findOne({
      where: { email },
    });

    if (existingAdmin) {
      throw new BadRequestException('Ya existe un usuario con ese email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = this.userRepository.create({
      nombres,
      apellidos,
      email,
      password: hashedPassword,
      carnet: null,
      fechaNacimiento: null,
      role: Role.ADMIN,
      activo: true,
    });

    const savedAdmin = await this.userRepository.save(admin);

    return {
      message: 'Administrador registrado correctamente',
      user: {
        id: savedAdmin.id,
        nombres: savedAdmin.nombres,
        apellidos: savedAdmin.apellidos,
        email: savedAdmin.email,
        role: savedAdmin.role,
      },
    };
  }

  async loginAdmin(loginAdminDto: LoginAdminDto) {
    const { email, password } = loginAdminDto;

    const admin = await this.userRepository.findOne({
      where: { email, role: Role.ADMIN },
    });

    if (!admin) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!admin.password) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!admin.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const payload = {
      sub: admin.id,
      role: admin.role,
      email: admin.email,
    };

    return {
      message: 'Login de administrador exitoso',
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: admin.id,
        nombres: admin.nombres,
        apellidos: admin.apellidos,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async loginVoter(loginVoterDto: LoginVoterDto) {
    const { carnet, fechaNacimiento } = loginVoterDto;

    const voter = await this.userRepository.findOne({
      where: { carnet, role: Role.VOTANTE },
    });

    if (!voter) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!voter.fechaNacimiento) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const voterFecha = new Date(voter.fechaNacimiento)
      .toISOString()
      .split('T')[0];
    const inputFecha = new Date(fechaNacimiento).toISOString().split('T')[0];

    if (voterFecha !== inputFecha) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!voter.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const payload = {
      sub: voter.id,
      role: voter.role,
      carnet: voter.carnet,
    };

    return {
      message: 'Login de votante exitoso',
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: voter.id,
        nombres: voter.nombres,
        apellidos: voter.apellidos,
        carnet: voter.carnet,
        role: voter.role,
      },
    };
  }

  async createVoter(createVoterDto: CreateVoterDto) {
    const { nombres, apellidos, carnet, fechaNacimiento } = createVoterDto;

    const existingVoter = await this.userRepository.findOne({
      where: { carnet },
    });

    if (existingVoter) {
      throw new BadRequestException('Ya existe un votante con ese carnet');
    }

    const voter = this.userRepository.create({
      nombres,
      apellidos,
      email: null,
      password: null,
      carnet,
      fechaNacimiento,
      role: Role.VOTANTE,
      activo: true,
    });

    const savedVoter = await this.userRepository.save(voter);

    return {
      message: 'Votante registrado correctamente',
      user: {
        id: savedVoter.id,
        nombres: savedVoter.nombres,
        apellidos: savedVoter.apellidos,
        carnet: savedVoter.carnet,
        fechaNacimiento: savedVoter.fechaNacimiento,
        role: savedVoter.role,
      },
    };
  }

  async getVoters() {
    const voters = await this.userRepository.find({
      where: { role: Role.VOTANTE },
      order: { id: 'DESC' },
    });

    return voters.map((voter) => ({
      id: voter.id,
      nombres: voter.nombres,
      apellidos: voter.apellidos,
      carnet: voter.carnet,
      fechaNacimiento: voter.fechaNacimiento,
      role: voter.role,
      activo: voter.activo,
    }));
  }
}

export async function getResults(token: string) {
  const response = await fetch('http://localhost:3000/votes/results', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener resultados');
  }

  return data;
}


