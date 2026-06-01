import { TenantManagementService } from './tenant-management.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
export declare class TenantManagementController {
    private readonly tenantService;
    constructor(tenantService: TenantManagementService);
    create(createDto: CreateTenantDto): Promise<{
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
    findAll(): Promise<({
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
    findOne(id: string): Promise<({
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
    update(id: string, updateDto: UpdateTenantDto): Promise<{
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
