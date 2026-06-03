import { PrismaClient } from '@prisma/client';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';
import { NotificationService } from '../notification/notification.service';
export declare class ContractService {
    private readonly prisma;
    private readonly notificationService;
    constructor(prisma: PrismaClient, notificationService: NotificationService);
    create(createDto: CreateContractDto, userId: string): Promise<{
        items: {
            id: string;
            contractId: string;
            discount: import("@prisma/client-runtime-utils").Decimal;
            moduleId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
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
        adjustmentIndexId: string | null;
        nextAdjustmentDate: Date | null;
    }>;
    findAll(): Promise<({
        customer: {
            document: string;
            corporateName: string;
        };
        items: {
            id: string;
            contractId: string;
            discount: import("@prisma/client-runtime-utils").Decimal;
            moduleId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
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
        adjustmentIndexId: string | null;
        nextAdjustmentDate: Date | null;
    })[]>;
    findOne(id: string): Promise<({
        customer: {
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
        product: {
            modules: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                updatedBy: string | null;
                productId: string;
                description: string | null;
                isActive: boolean;
                price: import("@prisma/client-runtime-utils").Decimal;
                isBaseOffer: boolean;
                maxQuantity: number | null;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            description: string | null;
            isActive: boolean;
            productGroupId: string | null;
        };
        items: {
            id: string;
            contractId: string;
            discount: import("@prisma/client-runtime-utils").Decimal;
            moduleId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
        }[];
        documents: {
            path: string;
            id: string;
            createdAt: Date;
            createdBy: string | null;
            status: string;
            contractId: string;
            type: string;
            clicksignKey: string | null;
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
        adjustmentIndexId: string | null;
        nextAdjustmentDate: Date | null;
    }) | null>;
    update(id: string, updateDto: UpdateContractDto, userId: string): Promise<{
        items: {
            id: string;
            contractId: string;
            discount: import("@prisma/client-runtime-utils").Decimal;
            moduleId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
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
        adjustmentIndexId: string | null;
        nextAdjustmentDate: Date | null;
    }>;
    updateStatus(id: string, updateStatusDto: UpdateContractStatusDto, userId: string): Promise<{
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
    remove(id: string): Promise<{
        message: string;
    }>;
}
