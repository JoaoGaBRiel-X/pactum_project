import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TENANT_PRISMA_SERVICE } from '../../tenant/tenant.module';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(TENANT_PRISMA_SERVICE)
    private readonly prisma: PrismaClient,
  ) {
    this.initMailer();
  }

  private async initMailer() {
    // Para desenvolvimento: usando Ethereal Email (fake SMTP)
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
    this.logger.log(`Ethereal Email account created: ${testAccount.user}`);
  }

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

  private replaceVariables(text: string, data: Record<string, any>): string {
    return text.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
      // path can be 'customer.name'
      const keys = path.split('.');
      let current = data;
      for (const key of keys) {
        if (current === undefined || current === null) return match;
        current = current[key];
      }
      return current !== undefined ? String(current) : match;
    });
  }

  async sendNotification(templateName: string, toEmail: string, data: Record<string, any>) {
    try {
      const template = await this.prisma.notificationTemplate.findUnique({
        where: { name: templateName },
      });

      if (!template || !template.isActive) {
        this.logger.warn(`Template ${templateName} not found or inactive. Skipping email.`);
        return null;
      }

      const subject = this.replaceVariables(template.subject, data);
      const content = this.replaceVariables(template.content, data);

      const info = await this.transporter.sendMail({
        from: '"Gestão de Contratos" <no-reply@gestaocontratos.local>',
        to: toEmail,
        subject: subject,
        html: content,
      });

      this.logger.log(`Message sent: ${info.messageId}`);
      this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      return info;
    } catch (error) {
      this.logger.error(`Error sending notification: ${error.message}`);
    }
  }
}
