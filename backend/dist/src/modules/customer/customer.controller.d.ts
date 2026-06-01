import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    create(createCustomerDto: CreateCustomerDto, req: any): Promise<{
        contacts: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: string | null;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            cpf: string | null;
            passwordHash: string | null;
            portalAccess: boolean;
            customerId: string;
        }[];
        partners: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            document: string;
            createdBy: string | null;
            updatedBy: string | null;
            customerId: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        tradeName: string | null;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        address: string | null;
        corporateGroupId: string | null;
        delinquencyScore: number;
    }>;
    findAll(): Promise<({
        corporateGroup: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
        } | null;
        contacts: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: string | null;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            cpf: string | null;
            passwordHash: string | null;
            portalAccess: boolean;
            customerId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        tradeName: string | null;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        address: string | null;
        corporateGroupId: string | null;
        delinquencyScore: number;
    })[]>;
    findOne(id: string): Promise<{
        corporateGroup: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
        } | null;
        contacts: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: string | null;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            cpf: string | null;
            passwordHash: string | null;
            portalAccess: boolean;
            customerId: string;
        }[];
        partners: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            document: string;
            createdBy: string | null;
            updatedBy: string | null;
            customerId: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
        contracts: ({
            product: {
                name: string;
            };
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        tradeName: string | null;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        address: string | null;
        corporateGroupId: string | null;
        delinquencyScore: number;
    }>;
    update(id: string, updateCustomerDto: any, req: any): Promise<{
        contacts: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            role: string | null;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            cpf: string | null;
            passwordHash: string | null;
            portalAccess: boolean;
            customerId: string;
        }[];
        partners: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            document: string;
            createdBy: string | null;
            updatedBy: string | null;
            customerId: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        tradeName: string | null;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        address: string | null;
        corporateGroupId: string | null;
        delinquencyScore: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
