import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    const { contacts, partners, ...customerData } = createCustomerDto;

    try {
      const customer = await this.prisma.customer.create({
        data: {
          ...customerData,
          createdBy: userId,
          contacts: contacts ? {
            create: contacts.map(c => ({ ...c, createdBy: userId }))
          } : undefined,
          partners: partners ? {
            create: partners.map(p => ({ ...p, createdBy: userId }))
          } : undefined,
        },
        include: {
          contacts: true,
          partners: true,
        }
      });
      return customer;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Já existe um cliente cadastrado com este CNPJ neste tenant.');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.customer.findMany({
      include: {
        contacts: true,
        corporateGroup: true,
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        contacts: true,
        partners: true,
        corporateGroup: true,
      }
    });
  }
}
