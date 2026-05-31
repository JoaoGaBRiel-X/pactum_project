import { PrismaClient } from '@prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomerService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    create(createCustomerDto: CreateCustomerDto, userId: string): Promise<{
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        tradeName: string | null;
        address: string | null;
        corporateGroupId: string | null;
        delinquencyScore: number;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string): Promise<{
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
