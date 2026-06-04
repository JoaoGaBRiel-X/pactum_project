import { Injectable, Logger, Inject } from '@nestjs/common';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';

@Injectable()
export class TenantSettingsService {
  private readonly logger = new Logger(TenantSettingsService.name);

  constructor(
    @Inject(TENANT_PRISMA_SERVICE) private readonly tenantClient: PrismaClient,
    private readonly prismaService: PrismaService,
  ) {}

  async getSettings(tenantId: string) {
    const publicTenant = await this.prismaService.client.tenant.findUnique({
      where: { id: tenantId },
      select: { 
        name: true, tradeName: true, document: true, legalRepName: true, legalRepCpf: true, slug: true,
        zipCode: true, street: true, number: true, complement: true, neighborhood: true, city: true, state: true
      }
    });

    let settings = await this.tenantClient.tenantSetting.findFirst();

    if (!settings) {
      settings = await this.tenantClient.tenantSetting.create({
        data: {
          primaryColor: '#1E40AF',
        }
      });
    }

    return { ...settings, ...publicTenant };
  }

  async updateSettings(tenantId: string, dto: UpdateTenantSettingsDto) {
    const { name, tradeName, document, legalRepName, legalRepCpf, slug, zipCode, street, number, complement, neighborhood, city, state, ...settingsData } = dto;

    if (slug) {
      const existing = await this.prismaService.client.tenant.findUnique({
        where: { slug }
      });
      if (existing && existing.id !== tenantId) {
        throw new Error('Este domínio já está em uso por outra empresa. Tente outro nome de domínio.');
      }
    }

    if (
      name || tradeName || document || slug !== undefined || 
      legalRepName !== undefined || legalRepCpf !== undefined ||
      zipCode !== undefined || street !== undefined || number !== undefined || 
      complement !== undefined || neighborhood !== undefined || 
      city !== undefined || state !== undefined
    ) {
      await this.prismaService.client.tenant.update({
        where: { id: tenantId },
        data: {
          ...(name && { name }),
          ...(tradeName && { tradeName }),
          ...(document && { document }),
          ...(slug !== undefined && { slug }),
          ...(legalRepName !== undefined && { legalRepName }),
          ...(legalRepCpf !== undefined && { legalRepCpf }),
          ...(zipCode !== undefined && { zipCode }),
          ...(street !== undefined && { street }),
          ...(number !== undefined && { number }),
          ...(complement !== undefined && { complement }),
          ...(neighborhood !== undefined && { neighborhood }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
        }
      });
    }

    let settings = await this.tenantClient.tenantSetting.findFirst();

    if (!settings) {
      settings = await this.tenantClient.tenantSetting.create({
        data: settingsData,
      });
    } else {
      settings = await this.tenantClient.tenantSetting.update({
        where: { id: settings.id },
        data: settingsData,
      });
    }

    const updatedPublicTenant = await this.prismaService.client.tenant.findUnique({
      where: { id: tenantId },
      select: { 
        name: true, tradeName: true, document: true, legalRepName: true, legalRepCpf: true, slug: true,
        zipCode: true, street: true, number: true, complement: true, neighborhood: true, city: true, state: true
      }
    });

    return { ...settings, ...updatedPublicTenant };
  }
}
