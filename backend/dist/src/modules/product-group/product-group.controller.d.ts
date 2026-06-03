import { ProductGroupService } from './product-group.service';
import { CreateProductGroupDto } from './dto/create-product-group.dto';
import { UpdateProductGroupDto } from './dto/update-product-group.dto';
export declare class ProductGroupController {
    private readonly productGroupService;
    constructor(productGroupService: ProductGroupService);
    create(createProductGroupDto: CreateProductGroupDto, req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
        isActive: boolean;
    }>;
    findAll(): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
        isActive: boolean;
    })[]>;
    findOne(id: string): Promise<{
        products: ({
            contracts: ({
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
            })[];
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
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
        isActive: boolean;
    }>;
    update(id: string, updateProductGroupDto: UpdateProductGroupDto, req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
        isActive: boolean;
    }>;
}
