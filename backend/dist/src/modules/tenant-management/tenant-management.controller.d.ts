import { TenantManagementService } from './tenant-management.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantManagementController {
    private readonly tenantService;
    constructor(tenantService: TenantManagementService);
    create(createDto: CreateTenantDto): Promise<{
        tenant: {
            name: string;
            id: string;
            document: string;
            schema: string;
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
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
