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
      useFactory: (request: Request, prisma: PrismaService) => {
        const tenantId = request.headers['x-tenant-id'] as string;
        
        // Se houver um tenant_id, configuramos o prisma para usar o schema dele
        if (tenantId) {
          // Utiliza Client Extension do Prisma para setar o search_path
          return prisma.$extends({
            query: {
              $allModels: {
                async $allOperations({ args, query }) {
                  const [, result] = await prisma.$transaction([
                    prisma.$executeRawUnsafe(`SET search_path TO "${tenantId}"`),
                    query(args),
                  ]);
                  return result;
                },
              },
            },
          });
        }

        // Caso não haja tenant_id, retorna o prisma normal (schema public)
        return prisma;
      },
    },
  ],
  exports: [PrismaService, TENANT_PRISMA_SERVICE],
})
export class TenantModule {}
