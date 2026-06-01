import { PrismaService } from '../../prisma/prisma.service';
export declare class ApiKeysController {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        clientId: string;
    }[]>;
    create(req: any, body: {
        name: string;
    }): Promise<{
        id: string;
        name: string;
        clientId: string;
        clientSecret: string;
        createdAt: Date;
    }>;
    remove(req: any, id: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
