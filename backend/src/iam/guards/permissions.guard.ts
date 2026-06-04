import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from './jwt-auth.guard';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantContext = request.tenantContext;

    if (!tenantContext) {
      // If there's no tenant context and the endpoint requires permissions, deny.
      throw new ForbiddenException('Contexto de permissões ausente.');
    }

    if (tenantContext.role === 'SUPERADMIN' || tenantContext.role === 'API_CLIENT') {
      return true;
    }

    const userPermissions = tenantContext.permissions || [];
    
    // Check if the user has ALL required permissions (or ANY? Let's implement ANY to be safer and simpler for multiple conditions, or we can enforce ALL)
    // Often it's ANY (has at least one of the required). E.g. RequirePermissions('customers:read', 'customers:read_own')
    const hasPermission = requiredPermissions.some(permission => userPermissions.includes(permission));

    if (!hasPermission) {
      throw new ForbiddenException('Acesso negado: permissões insuficientes.');
    }

    return true;
  }
}
