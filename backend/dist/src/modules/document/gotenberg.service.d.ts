export declare class GotenbergService {
    private readonly logger;
    private readonly gotenbergUrl;
    convertDocxToPdf(buffer: Buffer, filename: string): Promise<Buffer>;
}
