import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    create(createCustomerDto: CreateCustomerDto, req: any): Promise<{
        contacts: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
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
            document: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            customerId: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
            isLegalRep: boolean;
        }[];
        legalRepresentatives: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            cpf: string;
            customerId: string;
        }[];
    } & {
        number: string | null;
        id: string;
        document: string;
        tradeName: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        zipCode: string | null;
        street: string | null;
        complement: string | null;
        neighborhood: string | null;
        city: string | null;
        state: string | null;
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
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            role: string | null;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            cpf: string | null;
            passwordHash: string | null;
            portalAccess: boolean;
            customerId: string;
        }[];
        contracts: {
            status: string;
        }[];
    } & {
        number: string | null;
        id: string;
        document: string;
        tradeName: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        zipCode: string | null;
        street: string | null;
        complement: string | null;
        neighborhood: string | null;
        city: string | null;
        state: string | null;
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
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
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
            document: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            customerId: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
            isLegalRep: boolean;
        }[];
        legalRepresentatives: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            cpf: string;
            customerId: string;
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
        number: string | null;
        id: string;
        document: string;
        tradeName: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        zipCode: string | null;
        street: string | null;
        complement: string | null;
        neighborhood: string | null;
        city: string | null;
        state: string | null;
        corporateGroupId: string | null;
        delinquencyScore: number;
    }>;
    update(id: string, updateCustomerDto: any, req: any): Promise<{
        contacts: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
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
            document: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            customerId: string;
            share: import("@prisma/client-runtime-utils").Decimal | null;
            isLegalRep: boolean;
        }[];
        legalRepresentatives: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            createdBy: string | null;
            updatedBy: string | null;
            phone: string | null;
            cpf: string;
            customerId: string;
        }[];
    } & {
        number: string | null;
        id: string;
        document: string;
        tradeName: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        corporateName: string;
        zipCode: string | null;
        street: string | null;
        complement: string | null;
        neighborhood: string | null;
        city: string | null;
        state: string | null;
        corporateGroupId: string | null;
        delinquencyScore: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
