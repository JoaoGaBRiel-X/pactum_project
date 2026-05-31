import { PrismaService } from '../../prisma/prisma.service';
import 'dotenv/config';
export declare class ContractCronService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleContractRenewals(): Promise<void>;
}
