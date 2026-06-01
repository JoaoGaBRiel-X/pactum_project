import { PortalFinancialService } from './portal-financial.service';
export declare class PortalFinancialController {
    private readonly portalFinancialService;
    constructor(portalFinancialService: PortalFinancialService);
    findAll(tenantSlug: string, req: any): Promise<({
        contract: {
            id: string;
            product: {
                name: string;
            };
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
}
