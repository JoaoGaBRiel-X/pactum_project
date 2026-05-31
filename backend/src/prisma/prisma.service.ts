import { Injectable, OnModuleInit, OnModuleDestroy, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

export const TENANT_CONNECTION = 'TENANT_CONNECTION';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client: PrismaClient;

  constructor() {
    const url = new URL(process.env.DATABASE_URL as string);
    const pool = new Pool({
      user: url.username,
      password: url.password,
      host: url.hostname,
      port: parseInt(url.port, 10),
      database: url.pathname.slice(1),
      max: 20,
      options: '-c search_path=public', // Garante que o client global só acessa o schema public
    });
    const adapter = new PrismaPg(pool);
    this.client = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
