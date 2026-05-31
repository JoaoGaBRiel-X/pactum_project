import { PrismaClient } from '@prisma/client';
import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CreateSoftwareProductDto } from './dto/create-product.dto';
import { UpdateSoftwareProductDto } from './dto/update-product.dto';
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
    const product = await this.prisma.softwareProduct.findUnique({
      where: { id },
      include: {
        modules: true,
      }
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado.');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateSoftwareProductDto, userId: string) {
    const currentProduct = await this.findOne(id);
    const { modules, ...productData } = updateProductDto;

    // Se vierem módulos na requisição
    if (modules !== undefined) {
      const incomingModuleIds = modules.filter(m => m.id).map(m => m.id);
      
      // Módulos que existem no banco mas não vieram na requisição
      const modulesToInactivate = currentProduct.modules
        .filter(m => m.isActive && !incomingModuleIds.includes(m.id))
        .map(m => m.id);

      const modulesToCreate = modules.filter(m => !m.id);
      const modulesToUpdate = modules.filter(m => m.id);

      return this.prisma.softwareProduct.update({
        where: { id },
        data: {
          ...productData,
          updatedBy: userId,
          modules: {
            // Cria os novos
            create: modulesToCreate.map(m => ({
              name: m.name,
              description: m.description,
              price: m.price,
              createdBy: userId,
              updatedBy: userId,
            })),
            // Atualiza os existentes
            update: modulesToUpdate.map(m => ({
              where: { id: m.id },
              data: {
                name: m.name,
                description: m.description,
                price: m.price,
                isActive: true, // Garante que fique ativo
                updatedBy: userId,
              }
            })),
            // Inativa os que foram removidos
            updateMany: modulesToInactivate.length > 0 ? {
              where: { id: { in: modulesToInactivate } },
              data: { isActive: false, updatedBy: userId }
            } : undefined
          }
        },
        include: {
          modules: true,
        }
      });
    }

    // Se não vieram módulos, só atualiza os dados básicos do produto
    return this.prisma.softwareProduct.update({
      where: { id },
      data: {
        ...productData,
        updatedBy: userId,
      },
      include: {
        modules: true,
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.prisma.softwareProduct.delete({
        where: { id }
      });
      return { message: 'Produto excluído com sucesso.' };
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Não é possível excluir este produto, pois existem contratos vinculados a ele.');
      }
      throw error;
    }
  }
}
