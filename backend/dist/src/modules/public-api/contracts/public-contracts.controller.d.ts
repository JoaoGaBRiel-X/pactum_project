import { PrismaService } from '../../../prisma/prisma.service';
export declare class PublicContractsController {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(req: any): Promise<unknown>;
}
