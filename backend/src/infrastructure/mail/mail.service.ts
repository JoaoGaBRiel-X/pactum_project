import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025', 10),
      ignoreTLS: true,
    });
  }

  async sendUserInvitation(email: string, token: string) {
    const inviteLink = `http://localhost:3000/invite?token=${token}`;
    const mailOptions = {
      from: '"Lefer SaaS" <no-reply@lefer.com.br>',
      to: email,
      subject: 'Convite de Acesso - Lefer SaaS',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2>Você foi convidado!</h2>
          <p>Você recebeu um convite para acessar o sistema Lefer SaaS.</p>
          <p>Para aceitar o convite e definir sua senha, clique no botão abaixo:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #0ea5e9; color: #ffffff; text-decoration: none; border-radius: 5px;">
            Aceitar Convite
          </a>
          <p>Se você não solicitou este convite, pode ignorar este e-mail.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Invitation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      throw new Error('Failed to send invitation email');
    }
  }
}
