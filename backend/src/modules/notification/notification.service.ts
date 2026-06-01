import { Injectable, Inject, NotFoundException, Logger, Optional } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import { PrismaService } from '../../prisma/prisma.service';
import type { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
    private readonly publicPrisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue,
    @Optional() @Inject(REQUEST) private readonly request?: Request,
  ) {}

  async findAll() {
    return this.prisma.notificationTemplate.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.notificationTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Template não encontrado');
    return template;
  }

  async create(data: any, userId: string) {
    return this.prisma.notificationTemplate.create({
      data: {
        name: data.name,
        category: data.category || 'COMMERCIAL',
        subject: data.subject,
        content: data.content,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdBy: userId,
      },
    });
  }

  async update(id: string, data: any, userId: string) {
    return this.prisma.notificationTemplate.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        subject: data.subject,
        content: data.content,
        isActive: data.isActive,
        updatedBy: userId,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.notificationTemplate.delete({ where: { id } });
  }

  // Novo: Buscar histórico de comunicações de um cliente
  async findHistoryByCustomer(customerId: string) {
    return this.prisma.communicationHistory.findMany({
      where: { customerId },
      orderBy: { sentAt: 'desc' },
    });
  }

  // Push to BullMQ queue
  async sendNotification(templateName: string, toEmail: string, data: Record<string, any>, customerId?: string, userId?: string) {
    try {
      // Validate template exists before queueing
      const template = await this.prisma.notificationTemplate.findUnique({
        where: { name: templateName },
      });

      if (!template || !template.isActive) {
        this.logger.warn(`Template ${templateName} not found or inactive. Skip queue.`);
        return null;
      }

      // Resolve tenant schema from request header to pass to the async processor
      let tenantSchema: string | null = null;
      const tenantId = (this.request as any)?.headers?.['x-tenant-id'] as string;
      if (tenantId) {
        const tenant = await this.publicPrisma.client.tenant.findUnique({
          where: { id: tenantId },
          select: { schema: true },
        });
        tenantSchema = tenant?.schema ?? null;
      }

      await this.emailQueue.add('send-notification', {
        templateName,
        toEmail,
        data,
        customerId,
        userId,
        tenantSchema,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      });

      this.logger.log(`Job queued for template ${templateName} to ${toEmail} (schema: ${tenantSchema})`);
      return { success: true, message: 'Enfileirado com sucesso' };
    } catch (error) {
      this.logger.error(`Error queuing notification: ${error.message}`);
    }
  }
}
