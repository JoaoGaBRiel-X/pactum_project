import { PortalAuthService } from './portal-auth.service';
export declare class PortalAuthController {
    private readonly portalAuthService;
    constructor(portalAuthService: PortalAuthService);
    login(tenantSlug: string, body: any): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            tenantId: string;
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
