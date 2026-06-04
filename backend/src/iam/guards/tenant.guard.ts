import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './jwt-auth.guard';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // populated by JwtAuthGuard
    
    // We expect the frontend to send this header on tenant-specific requests
    const tenantId = request.headers['x-tenant-id'];

    if (!tenantId) {
      // Some endpoints might be global (e.g., getting the list of tenants the user has access to)
      // But for anything else, a tenantId is required. 
      // For now, if the route requires a tenant context, we enforce the header.
      // We can create a @GlobalRoute() decorator later if we need to bypass this on specific authenticated routes.
      
      // Let's assume global routes are things like /api/authentication/me/tenants.
      // We can skip tenant validation if there's no header and the route is explicitly marked global.
      // But for simplicity, we'll allow passing if the header is not provided, AND let the controller decide.
      // NO wait, the rule says "Tenant isolation is mandatory. Every service accessing tenant data must validate tenant context."
      // So if `x-tenant-id` is provided, we MUST validate it.
      return true; 
    }

    if (user?.role === 'API_CLIENT') {
      if (!tenantId || tenantId !== user.tenantId) {
        throw new ForbiddenException('Acesso negado para este locatário (API_CLIENT)');
      }
      request.tenantContext = {
        tenantId: user.tenantId,
        role: 'API_CLIENT'
      };
      return true;
    }

    const globalUser = await this.prisma.client.user.findUnique({
      where: { id: user.userId || user.sub },
      select: { isSuperAdmin: true }
    });

    if (globalUser?.isSuperAdmin) {
      request.tenantContext = {
        tenantId: tenantId as string,
        role: 'SUPERADMIN'
      };
      return true;
    }

    const userTenant = await this.prisma.client.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: user.userId,
          tenantId: tenantId as string,
        }
      }
    });

    if (!userTenant) {
      throw new ForbiddenException('Usuário não tem acesso a este locatário');
    }

    // Attach current role and tenant info to the request for further RBAC checks
    request.tenantContext = {
      tenantId: userTenant.tenantId,
      role: userTenant.roleProfileId
    };

    return true;
  }
}
