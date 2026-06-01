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
                name: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
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
            number: string | null;
            id: string;
            document: string;
            tradeName: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            corporateName: string;
            zipCode: string | null;
            street: string | null;
            complement: string | null;
            neighborhood: string | null;
            city: string | null;
            state: string | null;
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
