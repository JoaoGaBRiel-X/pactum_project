import { Global, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaService } from '../prisma/prisma.service';
import 'dotenv/config';

export const TENANT_PRISMA_SERVICE = 'TENANT_PRISMA_SERVICE';

/**
 * Cache global de PrismaClients por nome de schema.
 * Usa o parâmetro nativo `schema` do PrismaPg (pgOptions) que foi descoberto
 * inspecionando o código fonte do adapter. Esta é a forma correta e documentada
 * pelo adapter de definir o schema por cliente.
 */
export const tenantClientCache = new Map<string, PrismaClient>();

export async function getTenantClient(schemaName: string): Promise<PrismaClient> {
  if (tenantClientCache.has(schemaName)) {
    return tenantClientCache.get(schemaName)!;
  }

  const dbUrl = new URL(process.env.DATABASE_URL as string);

  const pool = new Pool({
    user: dbUrl.username,
    password: dbUrl.password,
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port, 10),
    database: dbUrl.pathname.slice(1),
    max: 5,
  });

  // Passa o schema diretamente para o PrismaPg via pgOptions.schema
  // Internamente o adapter usa isso para construir o search_path na conexão
  const adapter = new PrismaPg(pool, { schema: schemaName });
  const client = new PrismaClient({ adapter });
  await client.$connect();

  tenantClientCache.set(schemaName, client);
  return client;
}

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: TENANT_PRISMA_SERVICE,
      scope: Scope.REQUEST,
      inject: [REQUEST, PrismaService],
      useFactory: async (request: Request, prisma: PrismaService) => {
        const tenantId = request.headers['x-tenant-id'] as string;

        if (tenantId) {
          const tenant = await prisma.client.tenant.findUnique({
            where: { id: tenantId },
            select: { schema: true },
          });

          if (tenant?.schema) {
            return getTenantClient(tenant.schema);
          }
        }

        return prisma.client;
      },
    },
  ],
  exports: [PrismaService, TENANT_PRISMA_SERVICE],
})
export class TenantModule {}
