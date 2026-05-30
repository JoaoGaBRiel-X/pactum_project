import { ContractService } from './contract.service';
import { DocumentService } from './document/document.service';
import { CreateContractDto } from './dto/create-contract.dto';
export declare class ContractController {
    private readonly contractService;
    private readonly documentService;
    constructor(contractService: ContractService, documentService: DocumentService);
    generateDocument(id: string, req: any): Promise<{
        message: string;
        path: string;
    }>;
    create(createContractDto: CreateContractDto, req: any): Promise<{
        items: {
            id: string;
            contractId: string;
            moduleId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
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
    }>;
    findAll(): Promise<({
        customer: {
            document: string;
            corporateName: string;
        };
        items: {
            id: string;
            contractId: string;
            moduleId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
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
    })[]>;
    findOne(id: string): Promise<({
        items: {
            id: string;
            contractId: string;
            moduleId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
        }[];
        history: {
            id: string;
            status: string;
            totalValue: import("@prisma/client-runtime-utils").Decimal;
            contractId: string;
            modulesPayload: import("@prisma/client/runtime/client").JsonValue;
            changedAt: Date;
            changedBy: string | null;
            reason: string | null;
        }[];
    } & {
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
    }) | null>;
}
