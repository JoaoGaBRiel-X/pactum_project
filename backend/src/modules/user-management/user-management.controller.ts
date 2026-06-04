import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../../iam/guards/jwt-auth.guard';

import { Public } from '../../iam/decorators/public.decorator';

@Controller('users')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async listUsers(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'];
    return this.userManagementService.listUsers(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('roles')
  async listRoles(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'];
    return this.userManagementService.listRoles(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invite')
  async inviteUser(@Body() body: { email: string; roleProfileId: string }, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'];
    return this.userManagementService.inviteUser(body.email, body.roleProfileId, tenantId);
  }

  // This endpoint is public (used by the user from the email link)
  @Public()
  @Post('accept-invite')
  async acceptInvite(@Body() body: { token: string; passwordHash: string; name: string }) {
    console.log('Received accept-invite request with token:', body.token);
    return this.userManagementService.acceptInvite(body.token, body.passwordHash, body.name);
  }
}
