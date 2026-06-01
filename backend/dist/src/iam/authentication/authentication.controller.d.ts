import { AuthenticationService } from './authentication.service';
import { LoginDto, MfaVerifyDto } from './dto/login.dto';
export declare class AuthenticationController {
    private readonly authService;
    constructor(authService: AuthenticationService);
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
    refreshTokens(body: {
        refreshToken: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getMyTenants(req: any): Promise<{
        tenantId: string;
        name: string;
        document: string;
        role: string;
    }[]>;
}
