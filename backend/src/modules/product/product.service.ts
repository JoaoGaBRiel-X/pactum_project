import { PrismaClient } from '@prisma/client';
import { Injectable, Inject } from '@nestjs/common';
import { CreateSoftwareProductDto } from './dto/create-product.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

@Injectable()
export class ProductService {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
  ) {}

  async create(createProductDto: CreateSoftwareProductDto, userId: string) {
    const { modules, ...productData } = createProductDto;

    return this.prisma.softwareProduct.create({
      data: {
        ...productData,
        createdBy: userId,
        modules: modules ? {
          create: modules.map(m => ({ ...m, createdBy: userId }))
        } : undefined,
      },
      include: {
        modules: true,
      }
    });
  }

  async findAll() {
    return this.prisma.softwareProduct.findMany({
      include: {
        modules: true,
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.softwareProduct.findUnique({
      where: { id },
      include: {
        modules: true,
      }
    });
  }
}
