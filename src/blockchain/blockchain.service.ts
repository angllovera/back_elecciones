import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { Block } from './entities/block.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly defaultDifficulty = 2;

  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
  ) {}

  async onModuleInit() {
    await this.createGenesisBlock();
  }

  calculateHash(
    index: number,
    timestamp: string,
    data: string,
    previousHash: string,
    nonce: number,
    difficulty: number,
  ): string {
    return createHash('sha256')
      .update(`${index}${timestamp}${data}${previousHash}${nonce}${difficulty}`)
      .digest('hex');
  }

  mineBlock(
    index: number,
    timestamp: string,
    data: string,
    previousHash: string,
    difficulty: number,
  ) {
    let nonce = 0;
    let hash = this.calculateHash(
      index,
      timestamp,
      data,
      previousHash,
      nonce,
      difficulty,
    );

    const targetPrefix = '0'.repeat(difficulty);

    while (!hash.startsWith(targetPrefix)) {
      nonce++;
      hash = this.calculateHash(
        index,
        timestamp,
        data,
        previousHash,
        nonce,
        difficulty,
      );
    }

    return {
      nonce,
      hash,
      difficulty,
    };
  }

  async createGenesisBlock() {
    const existingBlocks = await this.blockRepository.count();

    if (existingBlocks > 0) {
      return;
    }

    const index = 0;
    const timestamp = new Date().toISOString();
    const data = JSON.stringify({ message: 'Genesis Block' });
    const previousHash = '0';
    const difficulty = this.defaultDifficulty;

    const mined = this.mineBlock(
      index,
      timestamp,
      data,
      previousHash,
      difficulty,
    );

    const genesisBlock = this.blockRepository.create({
      index,
      timestamp,
      data,
      previousHash,
      hash: mined.hash,
      nonce: mined.nonce,
      difficulty: mined.difficulty,
    });

    await this.blockRepository.save(genesisBlock);
  }

  async getLatestBlock(): Promise<Block> {
    const blocks = await this.blockRepository.find({
      order: { index: 'DESC' },
      take: 1,
    });

    const latestBlock = blocks[0];

    if (!latestBlock) {
      throw new Error('No existe bloque génesis');
    }

    return latestBlock;
  }

  async addBlock(dataObject: Record<string, any>) {
    const latestBlock = await this.getLatestBlock();

    const index = latestBlock.index + 1;
    const timestamp = new Date().toISOString();
    const data = JSON.stringify(dataObject);
    const previousHash = latestBlock.hash;
    const difficulty = this.defaultDifficulty;

    const mined = this.mineBlock(
      index,
      timestamp,
      data,
      previousHash,
      difficulty,
    );

    const newBlock = this.blockRepository.create({
      index,
      timestamp,
      data,
      previousHash,
      hash: mined.hash,
      nonce: mined.nonce,
      difficulty: mined.difficulty,
    });

    const savedBlock = await this.blockRepository.save(newBlock);

    return savedBlock;
  }

  async getChain() {
    return this.blockRepository.find({
      order: { index: 'ASC' },
    });
  }

  async validateChain() {
    const chain = await this.getChain();

    if (chain.length === 0) {
      return {
        valid: false,
        message: 'La cadena está vacía',
      };
    }

    for (let i = 0; i < chain.length; i++) {
      const currentBlock = chain[i];

      const recalculatedHash = this.calculateHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.previousHash,
        currentBlock.nonce,
        currentBlock.difficulty,
      );

      if (currentBlock.hash !== recalculatedHash) {
        return {
          valid: false,
          message: `Hash inválido en el bloque ${currentBlock.index}`,
        };
      }

      const targetPrefix = '0'.repeat(currentBlock.difficulty);

      if (!currentBlock.hash.startsWith(targetPrefix)) {
        return {
          valid: false,
          message: `El bloque ${currentBlock.index} no cumple la dificultad de minado`,
        };
      }

      if (i > 0) {
        const previousBlock = chain[i - 1];

        if (currentBlock.previousHash !== previousBlock.hash) {
          return {
            valid: false,
            message: `Ruptura de cadena en el bloque ${currentBlock.index}`,
          };
        }
      }
    }

    return {
      valid: true,
      message: 'La cadena es válida',
    };
  }

  async tamperBlock(blockId: number, newData: Record<string, any>) {
    const block = await this.blockRepository.findOne({
      where: { id: blockId },
    });

    if (!block) {
      throw new NotFoundException('Bloque no encontrado');
    }

    block.data = JSON.stringify(newData);

    await this.blockRepository.save(block);

    return {
      message: 'Bloque alterado manualmente para prueba',
      blockId: block.id,
      index: block.index,
    };
  }
}
