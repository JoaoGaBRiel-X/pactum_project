import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class PortalAuthService {
    private readonly globalPrisma;
    private readonly jwtService;
    constructor(globalPrisma: PrismaService, jwtService: JwtService);
    login(tenantSlug: string, email: string, passwordString: string): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            tenantId: string;
        };
    }>;
    setPassword(tenantSlug: string, contactId: string, passwordString: string): Promise<{
        message: string;
        contactId: string;
    }>;
}
