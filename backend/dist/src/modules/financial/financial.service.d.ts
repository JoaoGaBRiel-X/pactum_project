import { PrismaClient } from '@prisma/client';
export declare class FinancialService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAllReceivables(): Promise<({
        contract: {
            id: string;
            status: string;
        } | null;
        customer: {
            document: string;
            corporateName: string;
        };
    } & {
        id: string;
        contractId: string | null;
        customerId: string;
        description: string;
        type: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        dueDate: Date;
        status: string;
        competence: string | null;
        renegotiationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
    })[]>;
    generateBilling(userId: string): Promise<{
        message: string;
    }>;
    registerPayment(receivableId: string, amount: number, method: string, receiptBuffer?: Buffer, receiptName?: string, userId?: string): Promise<{
        id: string;
        contractId: string | null;
        customerId: string;
        description: string;
        type: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        dueDate: Date;
        status: string;
        competence: string | null;
        renegotiationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
    }>;
    createRenegotiation(customerId: string, receivableIds: string[], discount: number, userId: string): Promise<{
        id: string;
        customerId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        originalDebt: import("@prisma/client-runtime-utils").Decimal;
        interestApplied: import("@prisma/client-runtime-utils").Decimal;
        penaltyApplied: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        finalAmount: import("@prisma/client-runtime-utils").Decimal;
        consolidatedReceivableIds: import("@prisma/client/runtime/client").JsonValue;
    }>;
}
