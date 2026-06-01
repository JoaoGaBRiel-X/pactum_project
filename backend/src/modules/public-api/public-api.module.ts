import { Module } from '@nestjs/common';
import { OAuthController } from './oauth/oauth.controller';
import { OAuthService } from './oauth/oauth.service';
import { PublicCustomersController } from './customers/public-customers.controller';
import { PublicContractsController } from './contracts/public-contracts.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [OAuthController, PublicCustomersController, PublicContractsController],
  providers: [OAuthService, PrismaService],
})
export class PublicApiModule {}
