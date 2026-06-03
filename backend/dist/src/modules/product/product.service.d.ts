import { PrismaClient } from '@prisma/client';
import { CreateSoftwareProductDto } from './dto/create-product.dto';
import { UpdateSoftwareProductDto } from './dto/update-product.dto';
export declare class ProductService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    create(createProductDto: CreateSoftwareProductDto, userId: string): Promise<{
        productGroup: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            description: string | null;
            isActive: boolean;
        } | null;
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
    }>;
    findAll(): Promise<({
        _count: {
            contracts: number;
        };
        productGroup: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            description: string | null;
            isActive: boolean;
        } | null;
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
    })[]>;
    findOne(id: string): Promise<{
        productGroup: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            description: string | null;
            isActive: boolean;
        } | null;
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
    }>;
    update(id: string, updateProductDto: UpdateSoftwareProductDto, userId: string): Promise<{
        productGroup: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            description: string | null;
            isActive: boolean;
        } | null;
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
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
