import { Controller, Get, Put, Body, Req, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantSettingsService } from './tenant-settings.service';
import { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { Public } from '../../iam/decorators/public.decorator';

@Controller('tenant-settings')
export class TenantSettingsController {
  constructor(
    private readonly tenantSettingsService: TenantSettingsService,
    private readonly storageService: StorageService
  ) {}

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

  @Post('logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const tenantId = req.tenantContext?.tenantId || req.headers['x-tenant-id'];
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    if (!file) throw new BadRequestException('File is required');

    const extension = file.originalname.split('.').pop();
    const filename = `tenant-${tenantId}/logo-${Date.now()}.${extension}`;
    
    const logoUrl = await this.storageService.uploadFile(filename, file.buffer, file.mimetype);
    
    return this.tenantSettingsService.updateSettings(tenantId, { logoUrl });
  }
}
