import { DocumentService } from './document.service';
export declare class DocumentController {
    private readonly documentService;
    constructor(documentService: DocumentService);
    uploadTemplate(file: Express.Multer.File, name: string, description: string, req: any): Promise<{
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
    generateContract(contractId: string, templateId: string, req: any): Promise<{
        path: string;
        id: string;
        createdAt: Date;
        createdBy: string | null;
        status: string;
        contractId: string;
        type: string;
        clicksignKey: string | null;
    }>;
    manualSign(documentId: string, req: any): Promise<{
        path: string;
        id: string;
        createdAt: Date;
        createdBy: string | null;
        status: string;
        contractId: string;
        type: string;
        clicksignKey: string | null;
    }>;
}
