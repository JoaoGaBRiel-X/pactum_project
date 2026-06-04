import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticationService } from './authentication.service';
import { LoginDto, MfaVerifyDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';

@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica um usuário e retorna JWT ou aviso de MFA' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifica o token MFA e retorna o JWT' })
  verifyMfa(@Body() dto: MfaVerifyDto) {
    return this.authService.verifyMfa(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renova os tokens usando o Refresh Token' })
  refreshTokens(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken);
  }

  // To do: setup mfa routes would need a valid JWT token to know WHICH user to setup.
  // We will need a JwtGuard first.

  @Get('me')
  @ApiOperation({ summary: 'Retorna os dados do perfil do usuário logado' })
  getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualiza os dados do perfil do usuário logado' })
  updateProfile(@Req() req: any, @Body() body: { name?: string; password?: string }) {
    return this.authService.updateProfile(req.user.userId, body);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Faz upload do avatar do usuário logado' })
  uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return this.authService.uploadAvatar(req.user.userId, file);
  }

  @Get('me/tenants')
  @ApiOperation({ summary: 'Retorna a lista de locatários aos quais o usuário tem acesso' })
  getMyTenants(@Req() req: any) {
    return this.authService.getUserTenants(req.user.userId);
  }
}
