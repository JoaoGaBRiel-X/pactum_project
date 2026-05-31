import { FinancialService } from './financial.service';
export declare class FinancialController {
    private readonly financialService;
    constructor(financialService: FinancialService);
    findAllReceivables(): Promise<({
        customer: {
            document: string;
            corporateName: string;
        };
        contract: {
            id: string;
            status: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        customerId: string;
        status: string;
        contractId: string | null;
        description: string;
        type: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        dueDate: Date;
        competence: string | null;
        renegotiationId: string | null;
        boletoUrl: string | null;
    })[]>;
    generateBilling(req: any): Promise<{
        message: string;
    }>;
    registerPayment(body: any, file: Express.Multer.File, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        customerId: string;
        status: string;
        contractId: string | null;
        description: string;
        type: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        dueDate: Date;
        competence: string | null;
        renegotiationId: string | null;
        boletoUrl: string | null;
    }>;
    createRenegotiation(body: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        customerId: string;
        status: string;
        originalDebt: import("@prisma/client-runtime-utils").Decimal;
        interestApplied: import("@prisma/client-runtime-utils").Decimal;
        penaltyApplied: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        finalAmount: import("@prisma/client-runtime-utils").Decimal;
        consolidatedReceivableIds: import("@prisma/client/runtime/client").JsonValue;
    }>;
    uploadBoleto(id: string, file: Express.Multer.File, req: any): Promise<{
        customer: {
            contacts: {
                id: string;
                email: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                role: string | null;
                createdBy: string | null;
                updatedBy: string | null;
                phone: string | null;
                cpf: string | null;
                passwordHash: string | null;
                portalAccess: boolean;
                customerId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            document: string;
            createdBy: string | null;
            updatedBy: string | null;
            corporateName: string;
            tradeName: string | null;
            address: string | null;
            corporateGroupId: string | null;
            delinquencyScore: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        customerId: string;
        status: string;
        contractId: string | null;
        description: string;
        type: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        dueDate: Date;
        competence: string | null;
        renegotiationId: string | null;
        boletoUrl: string | null;
    }>;
}
