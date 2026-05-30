import { PrismaClient } from '@prisma/client';
import { CreateSoftwareProductDto } from './dto/create-product.dto';
export declare class ProductService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    create(createProductDto: CreateSoftwareProductDto, userId: string): Promise<{
        modules: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            productId: string;
            description: string | null;
            isActive: boolean;
            price: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
        isActive: boolean;
    }>;
    findAll(): Promise<({
        modules: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            productId: string;
            description: string | null;
            isActive: boolean;
            price: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
        isActive: boolean;
    })[]>;
    findOne(id: string): Promise<({
        modules: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            productId: string;
            description: string | null;
            isActive: boolean;
            price: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
        isActive: boolean;
    }) | null>;
}
