import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class BackofficeGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    // TODO: Melhoria Futura (Fase 13)
    // Este fluxo de API Key via variável de ambiente é provisório.
    // O ideal é usar o Global Admin Authentication baseado em JWT, 
    // avaliando Roles de nível "Super Admin" do IAM.
    const expectedKey = process.env.BACKOFFICE_API_KEY || 'lefer-secret-dev-key';

    if (!apiKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('Acesso restrito ao Backoffice da Lefer. Chave de API inválida.');
    }

    return true;
  }
}
