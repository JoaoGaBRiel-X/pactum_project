import { PrismaClient } from '@prisma/client';
import { CreateCorporateGroupDto } from './dto/create-corporate-group.dto';
import { UpdateCorporateGroupDto } from './dto/update-corporate-group.dto';
export declare class CorporateGroupService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    create(createCorporateGroupDto: CreateCorporateGroupDto, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
    }>;
    findAll(): Promise<({
        _count: {
            customers: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
    })[]>;
    findOne(id: string): Promise<{
        customers: {
            id: string;
            document: string;
            corporateName: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
    }>;
    update(id: string, updateCorporateGroupDto: UpdateCorporateGroupDto, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
