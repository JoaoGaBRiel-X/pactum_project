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
      select: { name: true, tradeName: true, document: true, legalRepName: true, legalRepCpf: true }
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
    const { name, tradeName, document, legalRepName, legalRepCpf, ...settingsData } = dto;

    if (name || tradeName || document || legalRepName !== undefined || legalRepCpf !== undefined) {
      await this.prismaService.client.tenant.update({
        where: { id: tenantId },
        data: {
          ...(name && { name }),
          ...(tradeName && { tradeName }),
          ...(document && { document }),
          ...(legalRepName !== undefined && { legalRepName }),
          ...(legalRepCpf !== undefined && { legalRepCpf })
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
      select: { name: true, tradeName: true, document: true, legalRepName: true, legalRepCpf: true }
    });

    return { ...settings, ...updatedPublicTenant };
  }
}
