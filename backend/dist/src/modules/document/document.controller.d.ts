import { DocumentService } from './document.service';
export declare class DocumentController {
    private readonly documentService;
    constructor(documentService: DocumentService);
    uploadTemplate(file: Express.Multer.File, name: string, description: string, req: any): Promise<{
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
    generateContract(contractId: string, templateId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        createdBy: string | null;
        status: string;
        contractId: string;
        type: string;
        path: string;
        clicksignKey: string | null;
    }>;
    manualSign(documentId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        createdBy: string | null;
        status: string;
        contractId: string;
        type: string;
        path: string;
        clicksignKey: string | null;
    }>;
}
