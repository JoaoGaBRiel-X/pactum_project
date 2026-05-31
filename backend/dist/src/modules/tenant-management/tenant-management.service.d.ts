import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantManagementService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createTenant(dto: CreateTenantDto): Promise<{
        name: string;
        id: string;
        document: string;
        schema: string;
        createdAt: Date;
        updatedAt: Date;
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
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
