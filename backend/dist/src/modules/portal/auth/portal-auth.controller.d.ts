import { PortalAuthService } from './portal-auth.service';
export declare class PortalAuthController {
    private readonly portalAuthService;
    constructor(portalAuthService: PortalAuthService);
    login(tenantSlug: string, body: any): Promise<{
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
    refreshTokens(body: {
        refreshToken: string;
    }): Promise<{
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
    setupPassword(body: {
        token: string;
        password: string;
    }): Promise<{
        message: string;
    }>;
    requestMagicLink(tenantSlug: string, body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
}
