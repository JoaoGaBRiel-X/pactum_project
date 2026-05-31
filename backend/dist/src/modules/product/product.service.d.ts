import { PrismaClient } from '@prisma/client';
import { CreateSoftwareProductDto } from './dto/create-product.dto';
import { UpdateSoftwareProductDto } from './dto/update-product.dto';
export declare class ProductService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    create(createProductDto: CreateSoftwareProductDto, userId: string): Promise<{
        modules: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
    }>;
    findAll(): Promise<({
        modules: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
    })[]>;
    findOne(id: string): Promise<{
        modules: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
    }>;
    update(id: string, updateProductDto: UpdateSoftwareProductDto, userId: string): Promise<{
        modules: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
