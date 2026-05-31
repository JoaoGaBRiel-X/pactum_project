export declare class TemplateService {
    private readonly logger;
    fillTemplate(templateBuffer: Buffer, data: Record<string, any>): Promise<Buffer>;
}
