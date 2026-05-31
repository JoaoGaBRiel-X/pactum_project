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
            role: string | null;
            email: string;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            cpf: string | null;
            customerId: string;
        }[];
        partners: {
            name: string;
            id: string;
            document: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            customerId: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
    } & {
        id: string;
        document: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        tradeName: string | null;
        address: string | null;
        corporateGroupId: string | null;
        delinquencyScore: number;
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
            role: string | null;
            email: string;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            cpf: string | null;
            customerId: string;
        }[];
    } & {
        id: string;
        document: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        tradeName: string | null;
        address: string | null;
        corporateGroupId: string | null;
        delinquencyScore: number;
    })[]>;
    findOne(id: string): Promise<{
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
            role: string | null;
            email: string;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            cpf: string | null;
            customerId: string;
        }[];
        partners: {
            name: string;
            id: string;
            document: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            customerId: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
    } & {
        id: string;
        document: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        tradeName: string | null;
        address: string | null;
        corporateGroupId: string | null;
        delinquencyScore: number;
    }>;
    update(id: string, updateCustomerDto: any, req: any): Promise<{
        contacts: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: string | null;
            email: string;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            cpf: string | null;
            customerId: string;
        }[];
        partners: {
            name: string;
            id: string;
            document: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            customerId: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
        }[];
    } & {
        id: string;
        document: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        tradeName: string | null;
        address: string | null;
        corporateGroupId: string | null;
        delinquencyScore: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
