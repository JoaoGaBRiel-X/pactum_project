import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { WebhookController } from './webhook.controller';
import { DocumentService } from './document.service';
import { TemplateService } from './template.service';
import { GotenbergService } from './gotenberg.service';
import { ClicksignService } from './clicksign.service';
import { TenantModule } from '../../tenant/tenant.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [TenantModule, PrismaModule],
  controllers: [DocumentController, WebhookController],
  providers: [DocumentService, TemplateService, GotenbergService, ClicksignService],
  exports: [DocumentService]
})
export class DocumentModule {}
