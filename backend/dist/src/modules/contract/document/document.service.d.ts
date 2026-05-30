import { PrismaClient } from '@prisma/client';
export declare class DocumentService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaClient);
    generateContractDocument(contractId: string, userId: string): Promise<string>;
    private generateFallbackTxt;
}
