import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TokenRequestDto } from './dto/token-request.dto';

@Injectable()
export class OAuthService {
  constructor(
    private globalPrisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async generateToken(dto: TokenRequestDto) {
    if (dto.grant_type !== 'client_credentials') {
      throw new BadRequestException('Unsupported grant type');
    }

    const apiClient = await this.globalPrisma.client.apiClient.findUnique({
      where: { clientId: dto.client_id },
      include: { tenant: true },
    });

    if (!apiClient) {
      throw new UnauthorizedException('Invalid client_id or client_secret');
    }

    const isMatch = await bcrypt.compare(dto.client_secret, apiClient.clientSecretHash);
    
    if (!isMatch) {
      throw new UnauthorizedException('Invalid client_id or client_secret');
    }

    const payload = {
      sub: apiClient.id,
      clientId: apiClient.clientId,
      tenantId: apiClient.tenantId,
      schema: apiClient.tenant.schema,
      role: 'API_CLIENT',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }
}
