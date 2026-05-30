import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
export declare const TENANT_CONNECTION = "TENANT_CONNECTION";
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    client: PrismaClient;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
