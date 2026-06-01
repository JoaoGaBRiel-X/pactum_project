import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtAuthGuard } from '../../../iam/guards/jwt-auth.guard';
import { TenantGuard } from '../../../iam/guards/tenant.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Public API - Contracts')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'ID do Locatário (Tenant) que a API Key pertence',
  required: true,
})
@UseGuards(ThrottlerGuard, JwtAuthGuard, TenantGuard)
@Controller('public/contracts')
export class PublicContractsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar contratos do locatário (Tenant)' })
  @ApiResponse({ status: 200, description: 'Lista de contratos retornada com sucesso' })
  async findAll(@Req() req: any) {
    const schema = req.user.schema;
    const query = `SELECT * FROM ${schema}.contracts LIMIT 100`;
    const result = await this.prisma.client.$queryRawUnsafe(query);
    return result;
  }
}
