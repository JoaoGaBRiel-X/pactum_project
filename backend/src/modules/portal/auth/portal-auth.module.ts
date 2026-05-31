import { Module } from '@nestjs/common';
import { PortalAuthService } from './portal-auth.service';
import { PortalAuthController } from './portal-auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TenantModule } from '../../../tenant/tenant.module';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  imports: [
    TenantModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [PortalAuthController],
  providers: [PortalAuthService, PrismaService],
  exports: [PortalAuthService],
})
export class PortalAuthModule {}
