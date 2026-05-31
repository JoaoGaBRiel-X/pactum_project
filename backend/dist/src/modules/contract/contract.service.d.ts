import { PrismaClient } from '@prisma/client';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';
export declare class ContractService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    create(createDto: CreateContractDto, userId: string): Promise<{
        items: {
            id: string;
            moduleId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            contractId: string;
        }[];
    } & {
        id: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        totalValue: import("@prisma/client-runtime-utils").Decimal;
        globalDiscount: import("@prisma/client-runtime-utils").Decimal;
        renewalMode: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        customerId: string;
        productId: string;
    }>;
    findAll(): Promise<({
        customer: {
            document: string;
            corporateName: string;
        };
        items: {
            id: string;
            moduleId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            contractId: string;
        }[];
    } & {
        id: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        totalValue: import("@prisma/client-runtime-utils").Decimal;
        globalDiscount: import("@prisma/client-runtime-utils").Decimal;
        renewalMode: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        customerId: string;
        productId: string;
    })[]>;
    findOne(id: string): Promise<({
        items: {
            id: string;
            moduleId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            contractId: string;
        }[];
        history: {
            id: string;
            status: string;
            totalValue: import("@prisma/client-runtime-utils").Decimal;
            contractId: string;
            changedAt: Date;
            modulesPayload: import("@prisma/client/runtime/client").JsonValue;
            changedBy: string | null;
            reason: string | null;
        }[];
    } & {
        id: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        totalValue: import("@prisma/client-runtime-utils").Decimal;
        globalDiscount: import("@prisma/client-runtime-utils").Decimal;
        renewalMode: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        customerId: string;
        productId: string;
    }) | null>;
    update(id: string, updateDto: UpdateContractDto, userId: string): Promise<{
        items: {
            id: string;
            moduleId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            contractId: string;
        }[];
    } & {
        id: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        totalValue: import("@prisma/client-runtime-utils").Decimal;
        globalDiscount: import("@prisma/client-runtime-utils").Decimal;
        renewalMode: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        customerId: string;
        productId: string;
    }>;
    updateStatus(id: string, updateStatusDto: UpdateContractStatusDto, userId: string): Promise<{
        id: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        totalValue: import("@prisma/client-runtime-utils").Decimal;
        globalDiscount: import("@prisma/client-runtime-utils").Decimal;
        renewalMode: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        customerId: string;
        productId: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
