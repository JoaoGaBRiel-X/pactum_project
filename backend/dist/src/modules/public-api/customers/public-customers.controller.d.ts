import { PrismaService } from '../../../prisma/prisma.service';
export declare class PublicCustomersController {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(req: any): Promise<unknown>;
}
