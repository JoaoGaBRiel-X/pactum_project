export declare class ClicksignService {
    private readonly logger;
    sendDocumentForSignature(documentBuffer: Buffer, fileName: string, signerInfo: {
        name: string;
        email: string;
    }): Promise<{
        documentKey: string;
        signerKey: string;
        status: string;
    }>;
}
