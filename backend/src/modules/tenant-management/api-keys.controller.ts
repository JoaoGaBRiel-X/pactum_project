import { Controller, Get, Post, Body, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../iam/guards/jwt-auth.guard';
import { TenantGuard } from '../../iam/guards/tenant.guard';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@ApiTags('Tenant API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('tenant-management/api-keys')
export class ApiKeysController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar chaves de API do locatário' })
  async findAll(@Req() req: any) {
    return this.prisma.client.apiClient.findMany({
      where: { tenantId: req.tenantContext.tenantId },
      select: { id: true, name: true, clientId: true, createdAt: true },
    });
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova chave de API' })
  async create(@Req() req: any, @Body() body: { name: string }) {
    const clientId = crypto.randomBytes(16).toString('hex');
    const clientSecret = crypto.randomBytes(32).toString('base64');
    const clientSecretHash = await bcrypt.hash(clientSecret, 10);

    const apiClient = await this.prisma.client.apiClient.create({
      data: {
        name: body.name,
        clientId,
        clientSecretHash,
        tenantId: req.tenantContext.tenantId,
      },
    });

    return {
      id: apiClient.id,
      name: apiClient.name,
      clientId: apiClient.clientId,
      clientSecret: clientSecret, // Returned ONLY once
      createdAt: apiClient.createdAt,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revogar uma chave de API' })
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.prisma.client.apiClient.deleteMany({
      where: {
        id,
        tenantId: req.tenantContext.tenantId,
      },
    });
  }
}
