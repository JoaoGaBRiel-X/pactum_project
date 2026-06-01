import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TokenRequestDto } from './dto/token-request.dto';
import { Public } from '../../../iam/decorators/public.decorator';

@ApiTags('Public API - OAuth')
@Controller('public/oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Public()
  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter access token via Client Credentials' })
  @ApiResponse({ status: 200, description: 'Token gerado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async getToken(@Body() dto: TokenRequestDto) {
    return this.oauthService.generateToken(dto);
  }
}
