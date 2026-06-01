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

  @Public()
  @Post('setup-password')
  @ApiOperation({ summary: 'Definir nova senha através do Magic Link' })
  setupPassword(@Body() body: { token: string; password: string }) {
    return this.portalAuthService.setupPassword(body.token, body.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('request-magic-link')
  @ApiOperation({ summary: 'Solicitar envio do Magic Link para acesso' })
  requestMagicLink(@Param('tenantSlug') tenantSlug: string, @Body() body: { email: string }) {
    return this.portalAuthService.requestMagicLink(tenantSlug, body.email);
  }
}
