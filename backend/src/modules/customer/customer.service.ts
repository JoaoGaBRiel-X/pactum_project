import { Injectable, ConflictException, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CUSTOMER_REPOSITORY } from './repositories/customer.repository.interface';
import type { ICustomerRepository } from './repositories/customer.repository.interface';
import { PortalAuthService } from '../portal/auth/portal-auth.service';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    private readonly portalAuthService: PortalAuthService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    const { contacts = [], partners, legalRepresentatives, ...dtoRest } = createCustomerDto;
    
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
      const group = await this.customerRepository.findGroupById(customerData.corporateGroupId);
      if (!group) throw new NotFoundException('Grupo Econômico não encontrado.');
    }

    try {
      const customer = await this.customerRepository.create({
        ...customerData,
        createdBy: userId,
        contacts: contacts.length > 0 ? {
          create: contacts.map(c => ({ ...c, createdBy: userId }))
        } : undefined,
        partners: partners && partners.length > 0 ? {
          create: partners.map(p => ({ ...p, createdBy: userId }))
        } : undefined,
        legalRepresentatives: legalRepresentatives && legalRepresentatives.length > 0 ? {
          create: legalRepresentatives.map(lr => ({ ...lr, createdBy: userId }))
        } : undefined,
      }, {
        contacts: true,
        partners: true,
        legalRepresentatives: true,
      });
      return customer;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Já existe um cliente cadastrado com este CNPJ neste tenant.');
      }
      throw error;
    }
  }

  async findAll(userId: string, permissions: string[]) {
    let whereClause: any = {};
    if (!permissions.includes('customers:read') && permissions.includes('customers:read_own')) {
      whereClause.createdBy = userId;
    }

    return this.customerRepository.findAll(whereClause, {
      contacts: true,
      corporateGroup: true,
      contracts: {
        select: {
          status: true
        }
      }
    });
  }

  async findOne(id: string, userId: string, permissions: string[]) {
    let whereClause: any = { id };
    if (!permissions.includes('customers:read') && permissions.includes('customers:read_own')) {
      whereClause.createdBy = userId;
    }

    const customer = await this.customerRepository.findById(id, whereClause, {
      contacts: true,
      partners: true,
      legalRepresentatives: true,
      corporateGroup: true,
      contracts: {
        include: {
          product: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado ou acesso negado.');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string, tenantSlug?: string, permissions: string[] = []) {
    // Verificar se existe
    const existingCustomer = await this.findOne(id, userId, permissions);

    // Validação da Regra de Negócio: Não pode alterar CNPJ se tiver contrato
    if (updateCustomerDto.document && updateCustomerDto.document !== existingCustomer.document) {
      if (existingCustomer.contracts && existingCustomer.contracts.length > 0) {
        throw new BadRequestException('Não é permitido alterar o CNPJ de um cliente que já possui contratos vinculados, pois isso descaracteriza o cliente.');
      }
    }

    const { contacts, partners, legalRepresentatives, ...dtoRest } = updateCustomerDto;
    
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
      const group = await this.customerRepository.findGroupById(customerData.corporateGroupId);
      if (!group) throw new NotFoundException('Grupo Econômico não encontrado.');
    }

    try {
      const customer = await this.customerRepository.update(id, {
        ...customerData,
        updatedBy: userId,
        contacts: finalContacts.length >= 0 && contacts !== undefined ? {
          deleteMany: {},
          create: finalContacts.map(c => ({ ...c, createdBy: userId, updatedBy: userId }))
        } : undefined,
        partners: partners !== undefined ? {
          deleteMany: {},
          create: partners.map(p => ({ ...p, createdBy: userId, updatedBy: userId }))
        } : undefined,
        legalRepresentatives: legalRepresentatives !== undefined ? {
          deleteMany: {},
          create: legalRepresentatives.map(lr => ({ ...lr, createdBy: userId, updatedBy: userId }))
        } : undefined,
      }, {
        contacts: true,
        partners: true,
        legalRepresentatives: true,
      });

      // Se informaram tenantSlug e contatos no payload, avaliamos o Magic Link
      if (tenantSlug && contacts && contacts.length > 0) {
        for (const c of customer.contacts) {
          const oldContact = existingCustomer.contacts.find((oc: any) => oc.email === c.email);
          // Se o novo estado tem portalAccess true, e antes era false (ou nulo)
          if (c.portalAccess && (!oldContact || !oldContact.portalAccess)) {
            try {
              await this.portalAuthService.generateSetupToken(tenantSlug, c.id, c.email);
            } catch (e) {
              console.error(`Falha ao disparar magic link para ${c.email}:`, e.message);
            }
          }
        }
      }

      return customer;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Já existe um cliente cadastrado com este CNPJ neste tenant.');
      }
      throw error;
    }
  }

  async remove(id: string, userId: string, permissions: string[]) {
    await this.findOne(id, userId, permissions);

    try {
      await this.customerRepository.delete(id);
      return { message: 'Cliente excluído com sucesso.' };
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Não é possível excluir este cliente, pois existem contratos ou registros vinculados a ele.');
      }
      throw error;
    }
  }
}
