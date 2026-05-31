import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { PortalFinancialService } from './portal-financial.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/guards/jwt-auth.guard';

@ApiTags('Portal Financial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('portal/:tenantSlug/financial')
export class PortalFinancialController {
  constructor(private readonly portalFinancialService: PortalFinancialService) {}

  @Get()
  @ApiOperation({ summary: 'List receivables for logged customer' })
  findAll(@Param('tenantSlug') tenantSlug: string, @Req() req: any) {
    const customerId = req.user.customerId;
    return this.portalFinancialService.findAll(tenantSlug, customerId);
  }
}
