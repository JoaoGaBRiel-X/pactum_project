import { Global, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export const TENANT_PRISMA_SERVICE = 'TENANT_PRISMA_SERVICE';

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
        
        // Se houver um tenant_id, buscamos o schema correspondente
        if (tenantId) {
          const tenant = await prisma.client.tenant.findUnique({
            where: { id: tenantId },
            select: { schema: true }
          });

          if (tenant) {
            // Utiliza Client Extension do Prisma para setar o search_path
            return prisma.client.$extends({
              query: {
                $allModels: {
                  async $allOperations({ args, query }) {
                    const [, result] = await prisma.client.$transaction([
                      prisma.client.$executeRawUnsafe(`SET search_path TO "${tenant.schema}"`),
                      query(args),
                    ]);
                    return result;
                  },
                },
              },
            });
          }
        }

        // Caso não haja tenant_id válido, retorna o prisma normal (schema public)
        return prisma.client;
      },
    },
  ],
  exports: [PrismaService, TENANT_PRISMA_SERVICE],
})
export class TenantModule {}
