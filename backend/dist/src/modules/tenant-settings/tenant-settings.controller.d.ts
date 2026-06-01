import { TenantSettingsService } from './tenant-settings.service';
import { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';
export declare class TenantSettingsController {
    private readonly tenantSettingsService;
    constructor(tenantSettingsService: TenantSettingsService);
    getSettings(req: any): Promise<{}>;
    updateSettings(req: any, dto: UpdateTenantSettingsDto): Promise<{
        name?: string | undefined;
        document?: string | undefined;
        slug?: string | null | undefined;
        tradeName?: string | null | undefined;
        legalRepName?: string | null | undefined;
        legalRepCpf?: string | null | undefined;
        id: string;
        logoUrl: string | null;
        primaryColor: string | null;
        secondaryColor: string | null;
        supportEmail: string | null;
        supportPhone: string | null;
        companyDocument: string | null;
        gatewayToken: string | null;
        clicksignToken: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
    }>;
}
