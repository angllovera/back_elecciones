import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { TamperBlockDto } from './dto/tamper-block.dto';
import { BlockchainService } from './blockchain.service';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('chain')
  getChain() {
    return this.blockchainService.getChain();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('validate')
  validateChain() {
    return this.blockchainService.validateChain();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('tamper')
  tamperBlock(@Body() tamperBlockDto: TamperBlockDto) {
    return this.blockchainService.tamperBlock(
      tamperBlockDto.blockId,
      tamperBlockDto.newData,
    );
  }
}