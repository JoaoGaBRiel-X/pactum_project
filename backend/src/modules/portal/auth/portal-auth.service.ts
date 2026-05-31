import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { getTenantClient } from '../../../tenant/tenant.module';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PortalAuthService {
  constructor(
    private readonly globalPrisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(tenantSlug: string, email: string, passwordString: string) {
    // 1. Encontrar o tenant pelo slug
    const tenant = await this.globalPrisma.client.tenant.findUnique({
      where: { schema: tenantSlug },
    });

    if (!tenant) {
      throw new NotFoundException('Empresa não encontrada');
    }

    if (!tenant.schema) {
      throw new UnauthorizedException('Configuração da empresa inválida');
    }

    // 2. Conectar no banco do tenant
    const tenantPrisma = await getTenantClient(tenant.schema);

    // 3. Procurar o contato e verificar a senha
    const contact = await tenantPrisma.contact.findFirst({
      where: { email },
    });

    if (!contact) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!contact.portalAccess) {
      throw new UnauthorizedException('Este contato não possui acesso ao portal. Fale com seu gestor.');
    }

    // Em uma app real, compararíamos hashes (ex: bcrypt).
    // Como simplificação, comparando direto ou hash fake caso usemos algo basico no debug
    if (contact.passwordHash !== passwordString) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 4. Gerar o Token
    const payload = {
      sub: contact.id,
      email: contact.email,
      role: 'CUSTOMER',
      tenantId: tenant.id,
      tenantSlug: tenant.schema,
      customerId: contact.customerId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        role: 'CUSTOMER',
        tenantId: tenant.id,
      }
    };
  }

  // Debug utility to set password during development
  async setPassword(tenantSlug: string, contactId: string, passwordString: string) {
    const tenant = await this.globalPrisma.client.tenant.findUnique({
      where: { schema: tenantSlug },
    });

    if (!tenant) throw new NotFoundException('Empresa não encontrada');
    
    const tenantPrisma = await getTenantClient(tenant.schema!);

    const contact = await tenantPrisma.contact.update({
      where: { id: contactId },
      data: {
        passwordHash: passwordString, // Should be bcrypt hash
        portalAccess: true,
      }
    });

    return { message: 'Senha definida com sucesso', contactId: contact.id };
  }
}
