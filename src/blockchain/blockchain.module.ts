import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './entities/block.entity';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';

@Module({
  imports: [TypeOrmModule.forFeature([Block])],
  controllers: [BlockchainController],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}