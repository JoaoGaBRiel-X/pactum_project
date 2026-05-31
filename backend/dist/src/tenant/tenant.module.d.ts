import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
export declare const TENANT_PRISMA_SERVICE = "TENANT_PRISMA_SERVICE";
export declare const tenantClientCache: Map<string, PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/client").DefaultArgs>>;
export declare function getTenantClient(schemaName: string): Promise<PrismaClient>;
export declare class TenantModule {
}
