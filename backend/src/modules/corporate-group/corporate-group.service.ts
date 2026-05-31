import { PrismaClient } from '@prisma/client';
import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CreateCorporateGroupDto } from './dto/create-corporate-group.dto';
import { UpdateCorporateGroupDto } from './dto/update-corporate-group.dto';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

@Injectable()
export class CorporateGroupService {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
  ) {}

  async create(createCorporateGroupDto: CreateCorporateGroupDto, userId: string) {
    return this.prisma.corporateGroup.create({
      data: {
        ...createCorporateGroupDto,
        createdBy: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.corporateGroup.findMany({
      include: {
        _count: {
          select: { customers: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.corporateGroup.findUnique({
      where: { id },
      include: {
        customers: {
          select: {
            id: true,
            corporateName: true,
            document: true
          }
        }
      }
    });

    if (!group) {
      throw new NotFoundException('Grupo Econômico não encontrado.');
    }

    return group;
  }

  async update(id: string, updateCorporateGroupDto: UpdateCorporateGroupDto, userId: string) {
    await this.findOne(id);

    return this.prisma.corporateGroup.update({
      where: { id },
      data: {
        ...updateCorporateGroupDto,
        updatedBy: userId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.prisma.corporateGroup.delete({
        where: { id }
      });
      return { message: 'Grupo Econômico excluído com sucesso.' };
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Não é possível excluir este grupo, pois existem clientes vinculados a ele.');
      }
      throw error;
    }
  }
}
