import { Module } from '@nestjs/common';
import { PortalFinancialService } from './portal-financial.service';
import { PortalFinancialController } from './portal-financial.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [PortalFinancialController],
  providers: [PortalFinancialService, PrismaService],
})
export class PortalFinancialModule {}
