import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    registerConsent(customerId: string, body: {
        documentRef: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        createdBy: string | null;
        customerId: string;
        documentRef: string;
        ipAddress: string | null;
        userAgent: string | null;
        acceptedAt: Date;
    }>;
    getConsents(customerId: string): Promise<{
        id: string;
        createdAt: Date;
        createdBy: string | null;
        customerId: string;
        documentRef: string;
        ipAddress: string | null;
        userAgent: string | null;
        acceptedAt: Date;
    }[]>;
}
