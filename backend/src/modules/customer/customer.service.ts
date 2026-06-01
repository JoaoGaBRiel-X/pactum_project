import { PrismaClient } from '@prisma/client';
import { Injectable, ConflictException, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    const { contacts = [], partners, ...dtoRest } = createCustomerDto;
    
    // As tipagens e o front enviam email/phone no DTO, mas eles pertencem aos contacts no BD.
    const { email, phone, ...customerData } = dtoRest as any;
    
    if (email || phone) {
      contacts.push({
        name: 'Contato Principal',
        email: email || '',
        phone: phone || '',
      });
    }

    if (customerData.corporateGroupId) {
      const group = await this.prisma.corporateGroup.findUnique({ where: { id: customerData.corporateGroupId } });
      if (!group) throw new NotFoundException('Grupo Econômico não encontrado.');
    }

    try {
      const customer = await this.prisma.customer.create({
        data: {
          ...customerData,
          createdBy: userId,
          contacts: contacts.length > 0 ? {
            create: contacts.map(c => ({ ...c, createdBy: userId }))
          } : undefined,
          partners: partners && partners.length > 0 ? {
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
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        contacts: true,
        partners: true,
        corporateGroup: true,
        contracts: {
          include: {
            product: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string) {
    // Verificar se existe
    await this.findOne(id);

    const { contacts, partners, ...dtoRest } = updateCustomerDto;
    
    const { email, phone, ...customerData } = dtoRest as any;
    
    // Tratamento de email e phone avulsos
    const finalContacts = contacts || [];
    if (email || phone) {
      finalContacts.push({
        name: 'Contato Principal',
        email: email || '',
        phone: phone || '',
      });
    }

    if (customerData.corporateGroupId) {
      const group = await this.prisma.corporateGroup.findUnique({ where: { id: customerData.corporateGroupId } });
      if (!group) throw new NotFoundException('Grupo Econômico não encontrado.');
    }

    try {
      const customer = await this.prisma.customer.update({
        where: { id },
        data: {
          ...customerData,
          updatedBy: userId,
          // Se finalContacts não for vazio, deletamos os antigos e criamos novos
          // Se for undefined ou vazio, não mexemos (ou poderíamos limpar tudo, mas o front manda o array inteiro)
          contacts: finalContacts.length >= 0 && contacts !== undefined ? {
            deleteMany: {},
            create: finalContacts.map(c => ({ ...c, createdBy: userId, updatedBy: userId }))
          } : undefined,
          partners: partners !== undefined ? {
            deleteMany: {},
            create: partners.map(p => ({ ...p, createdBy: userId, updatedBy: userId }))
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

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.prisma.customer.delete({
        where: { id }
      });
      return { message: 'Cliente excluído com sucesso.' };
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Não é possível excluir este cliente, pois existem contratos ou registros vinculados a ele.');
      }
      throw error;
    }
  }
}
