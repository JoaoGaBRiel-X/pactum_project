import { PrismaClient } from '@prisma/client';
import { GotenbergService } from './gotenberg.service';
import { TemplateService } from './template.service';
import { ClicksignService } from './clicksign.service';
export declare class DocumentService {
    private readonly prisma;
    private readonly gotenberg;
    private readonly template;
    private readonly clicksign;
    private readonly logger;
    constructor(prisma: PrismaClient, gotenberg: GotenbergService, template: TemplateService, clicksign: ClicksignService);
    getTemplates(): Promise<{
        path: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
        isActive: boolean;
    }[]>;
    generateContractDocument(contractId: string, templateId: string, userId: string): Promise<{
        path: string;
        id: string;
        createdAt: Date;
        createdBy: string | null;
        status: string;
        contractId: string;
        type: string;
        clicksignKey: string | null;
    }>;
    markAsManuallySigned(documentId: string, userId: string): Promise<{
        path: string;
        id: string;
        createdAt: Date;
        createdBy: string | null;
        status: string;
        contractId: string;
        type: string;
        clicksignKey: string | null;
    }>;
    uploadTemplate(file: Express.Multer.File, name: string, description: string, userId: string): Promise<{
        path: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        description: string | null;
        isActive: boolean;
    }>;
}
