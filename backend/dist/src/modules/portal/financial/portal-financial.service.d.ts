import { PrismaService } from '../../../prisma/prisma.service';
export declare class PortalFinancialService {
    private readonly globalPrisma;
    constructor(globalPrisma: PrismaService);
    findAll(tenantSlug: string, customerId: string): Promise<({
        contract: {
            id: string;
            product: {
                name: string;
            };
        } | null;
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
        boletoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
    })[]>;
}
