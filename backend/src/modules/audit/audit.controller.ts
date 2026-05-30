import { Controller, Post, Body, Req, Param, Get } from '@nestjs/common';
import { AuditService } from './audit.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('consent/:customerId')
  @ApiOperation({ summary: 'Registrar consentimento LGPD para um cliente' })
  registerConsent(
    @Param('customerId') customerId: string,
    @Body() body: { documentRef: string },
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system-user';
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.auditService.registerConsent(customerId, body.documentRef, ipAddress, userAgent, userId);
  }

  @Get('consent/:customerId')
  @ApiOperation({ summary: 'Listar histórico de consentimentos de um cliente' })
  getConsents(@Param('customerId') customerId: string) {
    return this.auditService.getConsents(customerId);
  }
}
