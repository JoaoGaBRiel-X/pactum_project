import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    create(createCustomerDto: CreateCustomerDto, req: any): Promise<{
        contacts: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            name: string;
            email: string;
            phone: string | null;
            role: string | null;
            customerId: string;
        }[];
        partners: {
            id: string;
            document: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            name: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
            customerId: string;
        }[];
    } & {
        id: string;
        document: string;
        corporateName: string;
        tradeName: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateGroupId: string | null;
    }>;
    findAll(): Promise<({
        corporateGroup: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            name: string;
        } | null;
        contacts: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            name: string;
            email: string;
            phone: string | null;
            role: string | null;
            customerId: string;
        }[];
    } & {
        id: string;
        document: string;
        corporateName: string;
        tradeName: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateGroupId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        corporateGroup: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            name: string;
        } | null;
        contacts: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            name: string;
            email: string;
            phone: string | null;
            role: string | null;
            customerId: string;
        }[];
        partners: {
            id: string;
            document: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            name: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
            customerId: string;
        }[];
    } & {
        id: string;
        document: string;
        corporateName: string;
        tradeName: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateGroupId: string | null;
    }>;
    update(id: string, updateCustomerDto: any, req: any): Promise<{
        contacts: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            name: string;
            email: string;
            phone: string | null;
            role: string | null;
            customerId: string;
        }[];
        partners: {
            id: string;
            document: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            name: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
            customerId: string;
        }[];
    } & {
        id: string;
        document: string;
        corporateName: string;
        tradeName: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateGroupId: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
