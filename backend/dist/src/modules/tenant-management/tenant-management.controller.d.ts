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
            createdAt: Date;
            updatedAt: Date;
            document: string;
            legalRepName: string | null;
            legalRepCpf: string | null;
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
        createdAt: Date;
        updatedAt: Date;
        document: string;
        legalRepName: string | null;
        legalRepCpf: string | null;
    })[]>;
    findOne(id: string): Promise<({
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
    update(id: string, updateDto: UpdateTenantDto): Promise<{
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
