import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
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
    create(body: any, req: any): Promise<{
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
    update(id: string, body: any, req: any): Promise<{
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
}
