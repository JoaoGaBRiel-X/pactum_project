import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { TokenRequestDto } from './dto/token-request.dto';
export declare class OAuthService {
    private globalPrisma;
    private jwtService;
    constructor(globalPrisma: PrismaService, jwtService: JwtService);
    generateToken(dto: TokenRequestDto): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }>;
}
