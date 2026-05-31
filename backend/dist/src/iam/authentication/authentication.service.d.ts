import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, MfaVerifyDto } from './dto/login.dto';
export declare class AuthenticationService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    } | {
        mfaRequired: boolean;
        email: string;
        message: string;
    }>;
    verifyMfa(dto: MfaVerifyDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    setupMfa(userId: string): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    enableMfa(userId: string, token: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    getUserTenants(userId: string): Promise<{
        tenantId: string;
        name: string;
        document: string;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
}
