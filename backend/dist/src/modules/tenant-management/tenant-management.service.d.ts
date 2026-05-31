import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantManagementService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createTenant(dto: CreateTenantDto): Promise<{
        tenant: {
            schema: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            document: string;
            legalRepName: string | null;
            legalRepCpf: string | null;
        };
        temporaryPassword: string;
    }>;
    listTenants(): Promise<({
        _count: {
            userLinks: number;
        };
    } & {
        schema: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        legalRepName: string | null;
        legalRepCpf: string | null;
    })[]>;
    getTenant(id: string): Promise<({
        userLinks: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            userId: string;
            tenantId: string;
            role: import("@prisma/client").$Enums.Role;
        })[];
    } & {
        schema: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        legalRepName: string | null;
        legalRepCpf: string | null;
    }) | null>;
    updateTenant(id: string, dto: any): Promise<{
        schema: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        document: string;
        legalRepName: string | null;
        legalRepCpf: string | null;
    }>;
}
