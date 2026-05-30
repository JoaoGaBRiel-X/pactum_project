import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, user } = req;

    return next.handle().pipe(
      tap(async (data) => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          const tenantId = req.headers['x-tenant-id'] as string;
          const userId = user?.id || 'system-user';
          
          if (tenantId) {
            try {
              await this.prisma.$transaction([
                this.prisma.$executeRawUnsafe(`SET search_path TO "${tenantId}"`),
                this.prisma.auditLog.create({
                  data: {
                    action: method,
                    tableName: url.split('?')[0],
                    recordId: data?.id || 'unknown',
                    newPayload: body,
                    userId: userId,
                  }
                })
              ]);
            } catch (e) {
              console.error('Failed to save audit log', e);
            }
          }
        }
      }),
    );
  }
}
