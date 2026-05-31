import { Controller, Post, Body, Param, HttpCode, HttpStatus, Get, Req, UseGuards } from '@nestjs/common';
import { PortalAuthService } from './portal-auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../../iam/decorators/public.decorator';

@ApiTags('Portal Authentication')
@Controller('portal/:tenantSlug/auth')
export class PortalAuthController {
  constructor(private readonly portalAuthService: PortalAuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login for Customer Contacts' })
  login(@Param('tenantSlug') tenantSlug: string, @Body() body: any) {
    return this.portalAuthService.login(tenantSlug, body.email, body.password);
  }

  // Debug route to set password for a contact
  @Public()
  @Post('set-password')
  @ApiOperation({ summary: 'Debug: Set password for a contact' })
  setPassword(@Param('tenantSlug') tenantSlug: string, @Body() body: any) {
    return this.portalAuthService.setPassword(tenantSlug, body.contactId, body.password);
  }
}
