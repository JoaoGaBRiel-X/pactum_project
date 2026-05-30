import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    create(createCustomerDto: CreateCustomerDto, req: any): Promise<{
        contacts: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            role: string | null;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            customerId: string;
        }[];
        partners: {
            name: string;
            id: string;
            createdAt: Date;
            document: string;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            customerId: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        document: string;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        tradeName: string | null;
        address: string | null;
        corporateGroupId: string | null;
    }>;
    findAll(): Promise<({
        corporateGroup: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
        } | null;
        contacts: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            role: string | null;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            customerId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        document: string;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        tradeName: string | null;
        address: string | null;
        corporateGroupId: string | null;
    })[]>;
    findOne(id: string): Promise<({
        corporateGroup: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
        } | null;
        contacts: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            role: string | null;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            customerId: string;
        }[];
        partners: {
            name: string;
            id: string;
            createdAt: Date;
            document: string;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            customerId: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        document: string;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        tradeName: string | null;
        address: string | null;
        corporateGroupId: string | null;
    }) | null>;
}
