import { TenantManagementService } from './tenant-management.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
export declare class TenantManagementController {
    private readonly tenantService;
    constructor(tenantService: TenantManagementService);
    create(createDto: CreateTenantDto): Promise<{
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
    findAll(): Promise<({
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
    findOne(id: string): Promise<({
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
    update(id: string, updateDto: UpdateTenantDto): Promise<{
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
