import { PrismaClient } from '@prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomerService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    create(createCustomerDto: CreateCustomerDto, userId: string): Promise<{
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
    update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string): Promise<{
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
