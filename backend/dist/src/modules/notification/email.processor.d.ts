import type { Job } from 'bull';
export declare class EmailProcessor {
    private readonly logger;
    private transporter;
    constructor();
    private initMailer;
    private replaceVariables;
    handleSendNotification(job: Job): Promise<{
        messageId: any;
    } | undefined>;
}
