import { Controller, Post, Body, Req } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';

@Controller('webhooks/clicksign')
export class WebhookController {
  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
  ) {}

  @Post()
  async handleWebhook(@Body() payload: any, @Req() req: any) {
    // A Clicksign envia o document key, o status, e outras infos.
    // Esse endpoint idealmente não usa o tenant_id do header, 
    // ele precisa procurar em todos os schemas ou usar um identificador global.
    // Para fins do PoC com Tenant_1 fixo no Header, simulamos aqui.
    
    // stub webhook
    return { received: true };
  }
}
