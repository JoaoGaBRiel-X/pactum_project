import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { getTenantClient } from '../../../tenant/tenant.module';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as nodemailer from 'nodemailer';

@Injectable()
export class PortalAuthService {
  private readonly logger = new Logger(PortalAuthService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly globalPrisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      ignoreTLS: true,
    });
  }

  async login(tenantSlug: string, email: string, passwordString: string, keepConnected: boolean = false) {
    // 1. Procurar o Tenant
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
    const contacts = await tenantPrisma.contact.findMany({
      where: { email },
    });

    if (contacts.length === 0) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const contact = contacts.find(c => c.portalAccess);

    if (!contact) {
      throw new UnauthorizedException('Este contato não possui acesso ao portal. Fale com seu gestor.');
    }

    if (!contact.passwordHash) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Comparação do Hash usando Argon2
    const isValid = await argon2.verify(contact.passwordHash, passwordString).catch(() => false);
    if (!isValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 4. Gerar o Token
    return this.generateTokens(contact, tenant, keepConnected);
  }

  private async generateTokens(contact: any, tenant: any, keepConnected: boolean) {
    const payload = {
      sub: contact.id,
      email: contact.email,
      role: 'CUSTOMER',
      tenantId: tenant.id,
      tenantSlug: tenant.schema,
      customerId: contact.customerId,
      kc: keepConnected
    };

    const refreshExpiresIn = keepConnected ? '4h' : '15m';

    return {
      access_token: await this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      refresh_token: await this.jwtService.signAsync(payload, { expiresIn: refreshExpiresIn }),
      user: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        role: 'CUSTOMER',
        tenantId: tenant.id,
      }
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const tenantSlug = payload.tenantSlug;
      
      const tenant = await this.globalPrisma.client.tenant.findUnique({
        where: { schema: tenantSlug },
      });
      if (!tenant) throw new UnauthorizedException('Tenant inválido');
      
      const tenantPrisma = await getTenantClient(tenant.schema);
      const contact = await tenantPrisma.contact.findUnique({
        where: { id: payload.sub }
      });
      
      if (!contact || !contact.portalAccess) throw new UnauthorizedException('Acesso revogado');

      return this.generateTokens(contact, tenant, payload.kc || false);
    } catch (e) {
      throw new UnauthorizedException('Token de renovação inválido ou expirado');
    }
  }

  // Método para gerar o Magic Link e disparar o e-mail
  async generateSetupToken(tenantSlug: string, contactId: string, email: string) {
    const tenant = await this.globalPrisma.client.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) throw new NotFoundException('Empresa não encontrada');

    // Token expira em 24h - usa o schema interno no payload para uso do getTenantClient
    const token = this.jwtService.sign({ sub: contactId, email, tenantSlug: tenant.schema, setup: true }, { expiresIn: '24h' });
    const setupLink = `http://localhost:3000/portal/${tenantSlug}/setup-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: '"Portal do Cliente" <no-reply@gestaocontratos.local>',
        to: email,
        subject: 'Crie sua senha de acesso ao Portal',
        html: `
          <h2>Bem-vindo ao Portal do Cliente!</h2>
          <p>Você recebeu acesso ao portal de contratos e faturas. Para começar, por favor defina sua senha clicando no link abaixo:</p>
          <p><a href="${setupLink}" style="display:inline-block;padding:10px 20px;background:#1E40AF;color:#fff;text-decoration:none;border-radius:5px;">Configurar Minha Senha</a></p>
          <p>Se você não solicitou este acesso, apenas ignore este e-mail.</p>
          <p><em>Este link é válido por 24 horas.</em></p>
        `,
      });
      this.logger.log(`Magic Link enviado para ${email}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar Magic Link para ${email}: ${error.message}`);
      throw new BadRequestException('Não foi possível enviar o e-mail de configuração de senha.');
    }

    return { message: 'E-mail enviado com sucesso.' };
  }

  async requestMagicLink(tenantSlug: string, email: string) {
    const tenant = await this.globalPrisma.client.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) throw new NotFoundException('Empresa não encontrada');

    const tenantClient = await getTenantClient(tenant.schema);
    const contact = await tenantClient.contact.findFirst({
      where: { email, portalAccess: true },
    });

    if (!contact) {
      this.logger.warn(`Tentativa de magic link para email não autorizado/inexistente no portal: ${email}`);
      return { message: 'Se o e-mail estiver cadastrado e possuir acesso ao portal, você receberá um link em breve.' };
    }

    await this.generateSetupToken(tenantSlug, contact.id, contact.email as string);
    
    return { message: 'Se o e-mail estiver cadastrado e possuir acesso ao portal, você receberá um link em breve.' };
  }

  // Método consumido pela tela pública de Setup de Senha
  async setupPassword(token: string, passwordString: string) {
    try {
      // Valida o JWT
      const payload = this.jwtService.verify(token);
      
      if (!payload.setup) {
        throw new BadRequestException('Token inválido para esta operação.');
      }

      const { sub: contactId, tenantSlug } = payload;

      const tenantPrisma = await getTenantClient(tenantSlug);
      
      // Gera o hash com Argon2
      const hashedPassword = await argon2.hash(passwordString);

      await tenantPrisma.contact.update({
        where: { id: contactId },
        data: {
          passwordHash: hashedPassword,
          portalAccess: true,
        }
      });

      return { message: 'Senha definida com sucesso.' };
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}
