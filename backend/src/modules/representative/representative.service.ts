import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';

@Injectable()
export class RepresentativeService {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
  ) {}

  async create(createRepresentativeDto: CreateRepresentativeDto) {
    return this.prisma.representative.create({
      data: createRepresentativeDto,
    });
  }

  async findAll() {
    return this.prisma.representative.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const representative = await this.prisma.representative.findUnique({
      where: { id },
      include: {
        opportunities: true,
        proposals: true,
        commissionEntries: {
          orderBy: { competence: 'desc' },
          take: 10,
        },
      },
    });

    if (!representative) {
      throw new NotFoundException(`Representative with ID ${id} not found`);
    }

    return representative;
  }

  async update(id: string, updateRepresentativeDto: UpdateRepresentativeDto) {
    await this.findOne(id); // Ensure it exists
    return this.prisma.representative.update({
      where: { id },
      data: updateRepresentativeDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure it exists
    return this.prisma.representative.delete({
      where: { id },
    });
  }

  // Specialized method for the commission statement dashboard
  async getCommissionStatement(id: string, competence?: string) {
    await this.findOne(id);

    const whereClause: any = { representativeId: id };
    if (competence) {
      whereClause.competence = competence;
    }

    return this.prisma.commissionEntry.findMany({
      where: whereClause,
      include: {
        contract: {
          select: { id: true, status: true, totalValue: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
