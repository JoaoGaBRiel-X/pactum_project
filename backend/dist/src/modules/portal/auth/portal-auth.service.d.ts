import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class PortalAuthService {
    private readonly globalPrisma;
    private readonly jwtService;
    private readonly logger;
    private transporter;
    constructor(globalPrisma: PrismaService, jwtService: JwtService);
    login(tenantSlug: string, email: string, passwordString: string, keepConnected?: boolean): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: string;
            tenantId: any;
        };
    }>;
    private generateTokens;
    refreshTokens(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: string;
            tenantId: any;
        };
    }>;
    generateSetupToken(tenantSlug: string, contactId: string, email: string): Promise<{
        message: string;
    }>;
    requestMagicLink(tenantSlug: string, email: string): Promise<{
        message: string;
    }>;
    setupPassword(token: string, passwordString: string): Promise<{
        message: string;
    }>;
}
