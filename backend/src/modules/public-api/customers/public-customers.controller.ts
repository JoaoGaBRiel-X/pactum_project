import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtAuthGuard } from '../../../iam/guards/jwt-auth.guard';
import { TenantGuard } from '../../../iam/guards/tenant.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Public API - Customers')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'ID do Locatário (Tenant) que a API Key pertence',
  required: true,
})
@UseGuards(ThrottlerGuard, JwtAuthGuard, TenantGuard)
@Controller('public/customers')
export class PublicCustomersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes do locatário (Tenant)' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso' })
  async findAll(@Req() req: any) {
    const schema = req.user.schema;
    const query = `SELECT * FROM ${schema}.customers LIMIT 100`;
    const result = await this.prisma.client.$queryRawUnsafe(query);
    return result;
  }
}
