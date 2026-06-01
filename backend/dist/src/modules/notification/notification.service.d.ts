import type { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { Queue } from 'bull';
export declare class NotificationService {
    private readonly prisma;
    private readonly publicPrisma;
    private emailQueue;
    private readonly request?;
    private readonly logger;
    constructor(prisma: PrismaClient, publicPrisma: PrismaService, emailQueue: Queue, request?: Request | undefined);
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        subject: string;
        content: string;
        isActive: boolean;
        category: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        subject: string;
        content: string;
        isActive: boolean;
        category: string;
    }>;
    create(data: any, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        subject: string;
        content: string;
        isActive: boolean;
        category: string;
    }>;
    update(id: string, data: any, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        subject: string;
        content: string;
        isActive: boolean;
        category: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        subject: string;
        content: string;
        isActive: boolean;
        category: string;
    }>;
    findHistoryByCustomer(customerId: string): Promise<{
        id: string;
        createdBy: string | null;
        customerId: string;
        status: string;
        templateName: string | null;
        subject: string;
        content: string;
        recipient: string;
        errorMessage: string | null;
        sentAt: Date;
    }[]>;
    sendNotification(templateName: string, toEmail: string, data: Record<string, any>, customerId?: string, userId?: string): Promise<{
        success: boolean;
        message: string;
    } | null | undefined>;
}
