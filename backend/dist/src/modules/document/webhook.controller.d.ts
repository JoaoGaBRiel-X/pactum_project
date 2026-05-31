import { PrismaClient } from '@prisma/client';
export declare class WebhookController {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    handleWebhook(payload: any, req: any): Promise<{
        received: boolean;
    }>;
}
