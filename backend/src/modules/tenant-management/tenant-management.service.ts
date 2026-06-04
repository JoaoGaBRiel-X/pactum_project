import { Injectable, ConflictException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import * as bcrypt from 'bcrypt';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

@Injectable()
export class TenantManagementService {
  private readonly logger = new Logger(TenantManagementService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createTenant(dto: CreateTenantDto) {
    // 1. Validar se CNPJ já existe
    const existingTenant = await this.prisma.client.tenant.findUnique({
      where: { document: dto.document },
    });

    if (existingTenant) {
      throw new ConflictException('Já existe um locatário com este CNPJ.');
    }

    // Verificar se o usuário já existe
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: dto.adminEmail },
    });

    // Se ele já existir, vamos apenas associá-lo ao novo tenant mais tarde.

    const schemaName = `tenant_${uuidv4().replace(/-/g, '').toLowerCase()}`;

    // TODO: Melhoria Futura - Disparo de E-mail
    // Atualmente estamos gerando a senha em texto plano e retornando no controller.
    // O ideal é enviar um e-mail transacional (AWS SES, SendGrid) com um link mágico 
    // ou senha temporária que expira.
    const generatedPassword = dto.adminPassword || Math.random().toString(36).slice(-8) + 'A@1';
    
    // Hash da senha do admin
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // 2. Criar Schema PostgreSQL PRIMEIRO
    try {
      await this.prisma.client.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
      this.logger.log(`Schema ${schemaName} criado com sucesso no banco de dados.`);
    } catch (error) {
      this.logger.error(`Erro ao criar schema ${schemaName}:`, error);
      throw new InternalServerErrorException('Falha ao criar o schema no banco de dados.');
    }

    // 3. Executar Prisma db push para provisionar as tabelas no novo schema
    try {
      const dbUrl = new URL(process.env.DATABASE_URL as string);
      dbUrl.searchParams.set('schema', schemaName);
      const pushUrl = dbUrl.toString();

      this.logger.log(`Executando prisma db push para o schema ${schemaName}...`);
      
      await execAsync('npx prisma db push --accept-data-loss', {
        env: {
          ...process.env,
          DATABASE_URL: pushUrl,
        }
      });
      
      this.logger.log(`Tabelas provisionadas com sucesso para ${schemaName}.`);
    } catch (error: any) {
      this.logger.error(`Erro ao rodar db push para ${schemaName}: ${error.message}`);
      // Clean up the schema if it fails
      await this.prisma.client.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      throw new InternalServerErrorException('Falha ao provisionar tabelas do locatário.');
    }

    // 4. Criar registro do Tenant
    const tenant = await this.prisma.client.tenant.create({
      data: {
        name: dto.name,
        document: dto.document,
        schema: schemaName,
        legalRepName: dto.legalRepName,
        legalRepCpf: dto.legalRepCpf,
        // Seed default role profiles for the tenant
        roleProfiles: {
          create: [
            { name: 'Admin', description: 'Acesso total ao sistema', permissions: ['*'] },
            { name: 'Financeiro', description: 'Acesso ao módulo financeiro', permissions: ['financial:read', 'financial:write'] },
            { name: 'Visualizador', description: 'Apenas visualização', permissions: ['contracts:read', 'customers:read'] },
          ]
        }
      },
      include: {
        roleProfiles: true,
      }
    });

    const adminProfile = tenant.roleProfiles.find(p => p.name === 'Admin');

    // 5. Vincular/Criar Usuário Admin
    if (existingUser) {
      await this.prisma.client.userTenant.create({
        data: {
          userId: existingUser.id,
          tenantId: tenant.id,
          roleProfileId: adminProfile?.id,
        },
      });
    } else {
      await this.prisma.client.user.create({
        data: {
          email: dto.adminEmail,
          password: hashedPassword,
          name: dto.adminName,
          tenantLinks: {
            create: {
              tenantId: tenant.id,
              roleProfileId: adminProfile?.id,
            },
          },
        },
      });
    }

    return { tenant, temporaryPassword: generatedPassword };
  }

  async listTenants() {
    return this.prisma.client.tenant.findMany({
      include: {
        _count: {
          select: { userLinks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTenant(id: string) {
    return this.prisma.client.tenant.findUnique({
      where: { id },
      include: {
        userLinks: {
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    });
  }

  async updateTenant(id: string, dto: any) {
    return this.prisma.client.tenant.update({
      where: { id },
      data: {
        name: dto.name,
        document: dto.document,
        legalRepName: dto.legalRepName,
        legalRepCpf: dto.legalRepCpf,
      }
    });
  }
}
