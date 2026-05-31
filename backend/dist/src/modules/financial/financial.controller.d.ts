import { FinancialService } from './financial.service';
export declare class FinancialController {
    private readonly financialService;
    constructor(financialService: FinancialService);
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
    generateBilling(req: any): Promise<{
        message: string;
    }>;
    registerPayment(body: any, file: Express.Multer.File, req: any): Promise<{
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
    createRenegotiation(body: any, req: any): Promise<{
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
