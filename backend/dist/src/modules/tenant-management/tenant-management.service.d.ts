import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantManagementService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createTenant(dto: CreateTenantDto): Promise<{
        tenant: {
            name: string;
            id: string;
            document: string;
            schema: string;
            legalRepName: string | null;
            legalRepCpf: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        temporaryPassword: string;
    }>;
    listTenants(): Promise<({
        _count: {
            userLinks: number;
        };
    } & {
        name: string;
        id: string;
        document: string;
        schema: string;
        legalRepName: string | null;
        legalRepCpf: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getTenant(id: string): Promise<({
        userLinks: ({
            user: {
                name: string;
                id: string;
                email: string;
            };
        } & {
            userId: string;
            tenantId: string;
            role: import("@prisma/client").$Enums.Role;
        })[];
    } & {
        name: string;
        id: string;
        document: string;
        schema: string;
        legalRepName: string | null;
        legalRepCpf: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    updateTenant(id: string, dto: any): Promise<{
        name: string;
        id: string;
        document: string;
        schema: string;
        legalRepName: string | null;
        legalRepCpf: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
