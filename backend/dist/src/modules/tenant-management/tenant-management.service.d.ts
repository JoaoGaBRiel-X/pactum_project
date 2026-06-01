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
            document: string;
            tradeName: string | null;
            slug: string | null;
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
        schema: string;
        id: string;
        name: string;
        document: string;
        tradeName: string | null;
        slug: string | null;
        legalRepName: string | null;
        legalRepCpf: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getTenant(id: string): Promise<({
        userLinks: ({
            user: {
                id: string;
                name: string;
                email: string;
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
        document: string;
        tradeName: string | null;
        slug: string | null;
        legalRepName: string | null;
        legalRepCpf: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    updateTenant(id: string, dto: any): Promise<{
        schema: string;
        id: string;
        name: string;
        document: string;
        tradeName: string | null;
        slug: string | null;
        legalRepName: string | null;
        legalRepCpf: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
