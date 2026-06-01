import { PrismaClient } from '@prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PortalAuthService } from '../portal/auth/portal-auth.service';
export declare class CustomerService {
    private readonly prisma;
    private readonly portalAuthService;
    constructor(prisma: PrismaClient, portalAuthService: PortalAuthService);
    create(createCustomerDto: CreateCustomerDto, userId: string): Promise<{
        contacts: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            cpf: string | null;
            role: string | null;
            passwordHash: string | null;
            portalAccess: boolean;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
        }[];
        partners: {
            id: string;
            name: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            document: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
            isLegalRep: boolean;
        }[];
        legalRepresentatives: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            cpf: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
        }[];
    } & {
        number: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        document: string;
        tradeName: string | null;
        corporateName: string;
        corporateGroupId: string | null;
        zipCode: string | null;
        street: string | null;
        complement: string | null;
        neighborhood: string | null;
        city: string | null;
        state: string | null;
        delinquencyScore: number;
    }>;
    findAll(): Promise<({
        contacts: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            cpf: string | null;
            role: string | null;
            passwordHash: string | null;
            portalAccess: boolean;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
        }[];
        corporateGroup: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
        } | null;
        contracts: {
            status: string;
        }[];
    } & {
        number: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        document: string;
        tradeName: string | null;
        corporateName: string;
        corporateGroupId: string | null;
        zipCode: string | null;
        street: string | null;
        complement: string | null;
        neighborhood: string | null;
        city: string | null;
        state: string | null;
        delinquencyScore: number;
    })[]>;
    findOne(id: string): Promise<{
        contacts: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            cpf: string | null;
            role: string | null;
            passwordHash: string | null;
            portalAccess: boolean;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
        }[];
        partners: {
            id: string;
            name: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            document: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
            isLegalRep: boolean;
        }[];
        legalRepresentatives: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            cpf: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
        }[];
        corporateGroup: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
        } | null;
        contracts: ({
            product: {
                name: string;
            };
        } & {
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
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
        number: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        document: string;
        tradeName: string | null;
        corporateName: string;
        corporateGroupId: string | null;
        zipCode: string | null;
        street: string | null;
        complement: string | null;
        neighborhood: string | null;
        city: string | null;
        state: string | null;
        delinquencyScore: number;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string, tenantSlug?: string): Promise<{
        contacts: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            cpf: string | null;
            role: string | null;
            passwordHash: string | null;
            portalAccess: boolean;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
        }[];
        partners: {
            id: string;
            name: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            document: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
            isLegalRep: boolean;
        }[];
        legalRepresentatives: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            cpf: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
        }[];
    } & {
        number: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        document: string;
        tradeName: string | null;
        corporateName: string;
        corporateGroupId: string | null;
        zipCode: string | null;
        street: string | null;
        complement: string | null;
        neighborhood: string | null;
        city: string | null;
        state: string | null;
        delinquencyScore: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
