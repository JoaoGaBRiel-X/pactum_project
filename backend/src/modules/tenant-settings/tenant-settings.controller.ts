import { Controller, Get, Put, Body, Req } from '@nestjs/common';
import { TenantSettingsService } from './tenant-settings.service';
import { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';

import { Public } from '../../iam/decorators/public.decorator';

@Controller('tenant-settings')
export class TenantSettingsController {
  constructor(private readonly tenantSettingsService: TenantSettingsService) {}

  @Public()
  @Get()
  async getSettings(@Req() req: any) {
    const tenantId = req.tenantContext?.tenantId || req.headers['x-tenant-id'];
    if (!tenantId) return {};
    return this.tenantSettingsService.getSettings(tenantId);
  }

  @Put()
  async updateSettings(@Req() req: any, @Body() dto: UpdateTenantSettingsDto) {
    const tenantId = req.tenantContext?.tenantId || req.headers['x-tenant-id'];
    return this.tenantSettingsService.updateSettings(tenantId, dto);
  }
}
