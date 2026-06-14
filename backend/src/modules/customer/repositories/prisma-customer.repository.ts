import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient, Customer, Prisma } from '@prisma/client';
import { ICustomerRepository } from './customer.repository.interface';
import { TENANT_PRISMA_SERVICE } from '../../../tenant/tenant.module';

@Injectable()
export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
  ) {}

  async create(data: Prisma.CustomerCreateInput | any, include?: Prisma.CustomerInclude): Promise<Customer | any> {
    return this.prisma.customer.create({
      data,
      include,
    });
  }

  async findAll(where?: Prisma.CustomerWhereInput, include?: Prisma.CustomerInclude): Promise<Customer[] | any[]> {
    return this.prisma.customer.findMany({
      where,
      include,
    });
  }

  async findById(id: string, where?: Prisma.CustomerWhereInput, include?: Prisma.CustomerInclude): Promise<Customer | any | null> {
    return this.prisma.customer.findFirst({
      where: { id, ...where },
      include,
    });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput | any, include?: Prisma.CustomerInclude): Promise<Customer | any> {
    return this.prisma.customer.update({
      where: { id },
      data,
      include,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customer.delete({
      where: { id },
    });
  }

  async findGroupById(groupId: string): Promise<any | null> {
    return this.prisma.corporateGroup.findUnique({
      where: { id: groupId },
    });
  }
}
