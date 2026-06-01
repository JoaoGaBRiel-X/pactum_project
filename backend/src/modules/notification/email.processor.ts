import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { getTenantClient } from '../../tenant/tenant.module';
import * as nodemailer from 'nodemailer';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initMailer();
  }

  private async initMailer() {
    // Ethereal Email para testes
    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    this.logger.log(`Ethereal Email worker ready: ${testAccount.user}`);
  }

  private replaceVariables(text: string, data: Record<string, any>): string {
    if (!text) return '';
    return text.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
      const keys = path.split('.');
      let current = data;
      for (const key of keys) {
        if (current === undefined || current === null) return match;
        current = current[key];
      }
      return current !== undefined ? String(current) : match;
    });
  }

  @Process('send-notification')
  async handleSendNotification(job: Job) {
    const { templateName, toEmail, data, customerId, userId, tenantSchema } = job.data;
    this.logger.log(`Processing email job for ${toEmail} using template ${templateName} (schema: ${tenantSchema})`);

    if (!tenantSchema) {
      this.logger.error(`No tenantSchema provided in job data. Cannot process job.`);
      return;
    }

    // Get the tenant-specific Prisma client
    const prisma = await getTenantClient(tenantSchema);

    let historyRecordId = null;

    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: { name: templateName },
      });

      if (!template || !template.isActive) {
        this.logger.warn(`Template ${templateName} not found or inactive. Job skipped.`);
        return;
      }

      const subject = this.replaceVariables(template.subject, data);
      const content = this.replaceVariables(template.content, data);

      // Criar History Pending
      if (customerId) {
        const history = await prisma.communicationHistory.create({
          data: {
            customerId,
            templateName,
            subject,
            content,
            recipient: toEmail,
            status: 'PENDING',
            createdBy: userId,
          }
        });
        historyRecordId = history.id;
      }

      const info = await this.transporter.sendMail({
        from: '"Gestão de Contratos" <no-reply@gestaocontratos.local>',
        to: toEmail,
        subject: subject,
        html: content,
      });

      this.logger.log(`Message sent: ${info.messageId}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

      if (historyRecordId) {
        await prisma.communicationHistory.update({
          where: { id: historyRecordId },
          data: { status: 'SENT' }
        });
      }

      return { messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Error sending notification: ${error.message}`);
      if (historyRecordId) {
        await prisma.communicationHistory.update({
          where: { id: historyRecordId },
          data: { status: 'FAILED', errorMessage: error.message }
        });
      }
      throw error;
    }
  }
}
