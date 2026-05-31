import { PrismaClient } from '@prisma/client';
import { BacenService } from './bacen.service';
export declare class AdjustmentService {
    private readonly prisma;
    private readonly bacen;
    private readonly logger;
    constructor(prisma: PrismaClient, bacen: BacenService);
    createIndex(data: {
        name: string;
        description?: string;
    }, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
    }>;
    findAllIndexes(): Promise<({
        rates: {
            id: string;
            competence: string;
            indexId: string;
            accumulatedRate: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
    })[]>;
    addRate(indexId: string, competence: string, accumulatedRate: number): Promise<{
        id: string;
        competence: string;
        indexId: string;
        accumulatedRate: import("@prisma/client-runtime-utils").Decimal;
    }>;
    applyManualAdjustment(contractId: string, percentage: number, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        customerId: string;
        productId: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        totalValue: import("@prisma/client-runtime-utils").Decimal;
        globalDiscount: import("@prisma/client-runtime-utils").Decimal;
        renewalMode: string;
        adjustmentIndexId: string | null;
        nextAdjustmentDate: Date | null;
    }>;
    handleAutomaticAdjustments(): Promise<void>;
    runAutomaticAdjustmentsForTenant(userId: string): Promise<{
        message: string;
    }>;
    syncBacenRatesForTenant(userId: string): Promise<{
        message: string;
    }>;
}
