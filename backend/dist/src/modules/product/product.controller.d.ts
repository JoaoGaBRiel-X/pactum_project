import { ProductService } from './product.service';
import { CreateSoftwareProductDto } from './dto/create-product.dto';
import { UpdateSoftwareProductDto } from './dto/update-product.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    create(createProductDto: CreateSoftwareProductDto, req: any): Promise<{
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
    update(id: string, updateProductDto: UpdateSoftwareProductDto, req: any): Promise<{
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
