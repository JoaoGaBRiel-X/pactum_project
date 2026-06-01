import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GotenbergService } from './gotenberg.service';
import { TemplateService } from './template.service';
import { ClicksignService } from './clicksign.service';
export declare class DocumentService {
    private readonly prisma;
    private readonly globalPrisma;
    private readonly gotenberg;
    private readonly template;
    private readonly clicksign;
    private readonly logger;
    constructor(prisma: PrismaClient, globalPrisma: PrismaService, gotenberg: GotenbergService, template: TemplateService, clicksign: ClicksignService);
    getTemplates(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
        isActive: boolean;
        path: string;
    }[]>;
    generateContractDocument(contractId: string, templateId: string, userId: string, tenantId?: string): Promise<{
        id: string;
        createdAt: Date;
        createdBy: string | null;
        status: string;
        contractId: string;
        type: string;
        path: string;
        clicksignKey: string | null;
    }>;
    markAsManuallySigned(documentId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        createdBy: string | null;
        status: string;
        contractId: string;
        type: string;
        path: string;
        clicksignKey: string | null;
    }>;
    uploadTemplate(file: Express.Multer.File, name: string, description: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
        isActive: boolean;
        path: string;
    }>;
}
