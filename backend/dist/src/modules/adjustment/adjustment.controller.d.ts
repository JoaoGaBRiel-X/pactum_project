import { AdjustmentService } from './adjustment.service';
export declare class AdjustmentController {
    private readonly adjustmentService;
    constructor(adjustmentService: AdjustmentService);
    createIndex(data: {
        name: string;
        description?: string;
    }, req: any): Promise<{
        name: string;
        id: string;
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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
    })[]>;
    addRate(data: {
        indexId: string;
        competence: string;
        accumulatedRate: number;
    }): Promise<{
        id: string;
        competence: string;
        indexId: string;
        accumulatedRate: import("@prisma/client-runtime-utils").Decimal;
    }>;
    applyManualAdjustment(id: string, data: {
        percentage: number;
    }, req: any): Promise<{
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
    runAutomaticAdjustments(req: any): Promise<{
        message: string;
    }>;
    syncBacenRates(req: any): Promise<{
        message: string;
    }>;
}
