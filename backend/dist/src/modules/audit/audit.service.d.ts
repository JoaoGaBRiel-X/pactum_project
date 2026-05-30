import { PrismaService } from '../../prisma/prisma.service';
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    registerConsent(customerId: string, documentRef: string, ipAddress: string, userAgent: string, userId: string): Promise<{
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
