import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, MfaVerifyDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.client.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.mfaEnabled) {
      // Se MFA estiver habilitado, não retornamos os tokens definitivos.
      // Retornamos um aviso para a UI chamar /mfa/verify
      return {
        mfaRequired: true,
        email: user.email,
        message: 'Autenticação de 2 fatores necessária.',
      };
    }

    return this.generateTokens(user.id);
  }

  async verifyMfa(dto: MfaVerifyDto) {
    const user = await this.prisma.client.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException(
        'MFA não está configurado para este usuário',
      );
    }

    const isValid = authenticator.verify({
      token: dto.token,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Código MFA inválido');
    }

    return this.generateTokens(user.id);
  }

  async setupMfa(userId: string) {
    const secret = authenticator.generateSecret();
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // Salva o segredo no banco (ainda não ativa até ele confirmar o primeiro código na UI, ou ativa direto dependendo do fluxo)
    // Para simplificar, vamos salvar e devolver o segredo
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { mfaSecret: secret, mfaEnabled: false }, // Fica false até validação final
    });

    const otpauthUrl = authenticator.keyuri(
      user.email,
      'Gestao_Contratos',
      secret,
    );

    return {
      secret,
      otpauthUrl, // Para gerar o QR Code no frontend
    };
  }

  async enableMfa(userId: string, token: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.mfaSecret)
      throw new NotFoundException('MFA Secret não configurado');

    const isValid = authenticator.verify({
      token,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Código MFA inválido');
    }

    await this.prisma.client.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    return { message: 'MFA habilitado com sucesso' };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async getUserTenants(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { isSuperAdmin: true },
    });

    if (user?.isSuperAdmin) {
      const allTenants = await this.prisma.client.tenant.findMany();
      return allTenants.map((t) => ({
        tenantId: t.id,
        name: t.name,
        document: t.document,
        role: 'SUPERADMIN',
      }));
    }

    const userTenants = await this.prisma.client.userTenant.findMany({
      where: { userId },
      include: {
        tenant: true,
      },
    });

    return userTenants.map((ut) => ({
      tenantId: ut.tenantId,
      name: ut.tenant.name,
      document: ut.tenant.document,
      role: ut.role,
    }));
  }
}
