import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductGroupDto } from './dto/create-product-group.dto';
import { UpdateProductGroupDto } from './dto/update-product-group.dto';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

@Injectable()
export class ProductGroupService {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
  ) {}

  async create(createProductGroupDto: CreateProductGroupDto, userId: string) {
    return this.prisma.productGroup.create({
      data: {
        ...createProductGroupDto,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.productGroup.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.productGroup.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            modules: true,
            contracts: {
              where: { status: 'ACTIVE' },
              include: {
                items: true
              }
            }
          }
        },
      }
    });

    if (!group) {
      throw new NotFoundException('Grupo de Produtos não encontrado.');
    }
    return group;
  }

  async update(id: string, updateProductGroupDto: UpdateProductGroupDto, userId: string) {
    await this.findOne(id); // Ensure it exists

    return this.prisma.productGroup.update({
      where: { id },
      data: {
        ...updateProductGroupDto,
        updatedBy: userId,
      },
    });
  }

  async remove(id: string) {
    const group = await this.findOne(id);

    if (group.products && group.products.length > 0) {
      throw new BadRequestException('Não é possível excluir o grupo de produtos pois ele possui produtos vinculados.');
    }

    return this.prisma.productGroup.delete({
      where: { id },
    });
  }
}
