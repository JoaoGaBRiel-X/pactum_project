import { PrismaClient } from '@prisma/client';
export declare class NotificationService {
    private readonly prisma;
    private transporter;
    private readonly logger;
    constructor(prisma: PrismaClient);
    private initMailer;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        isActive: boolean;
        subject: string;
        content: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        isActive: boolean;
        subject: string;
        content: string;
    }>;
    create(data: any, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        isActive: boolean;
        subject: string;
        content: string;
    }>;
    update(id: string, data: any, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        isActive: boolean;
        subject: string;
        content: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        isActive: boolean;
        subject: string;
        content: string;
    }>;
    private replaceVariables;
    sendNotification(templateName: string, toEmail: string, data: Record<string, any>): Promise<any>;
}
