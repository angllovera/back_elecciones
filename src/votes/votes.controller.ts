import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { CreateVoteDto } from './dto/create-vote.dto';
import { VotesService } from './votes.service';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VOTANTE)
  @Post()
  createVote(@Req() req: any, @Body() createVoteDto: CreateVoteDto) {
    return this.votesService.createVote(req.user.userId, createVoteDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VOTANTE)
  @Get('me')
  getMyVote(@Req() req: any) {
    return this.votesService.getMyVote(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('results')
  getResults() {
    return this.votesService.getResults();
  }
}