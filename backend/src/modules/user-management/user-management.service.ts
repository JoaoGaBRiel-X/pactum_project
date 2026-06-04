import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async listUsers(tenantId: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID is required');

    const userTenants = await this.prisma.client.userTenant.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          }
        },
        roleProfile: true,
      }
    });

    const invitations = await this.prisma.client.userInvitation.findMany({
      where: { tenantId },
      include: {
        tenant: true
      }
    });

    return {
      activeUsers: userTenants.map(ut => ({
        id: ut.user.id,
        name: ut.user.name,
        email: ut.user.email,
        avatarUrl: ut.user.avatarUrl,
        roleProfile: ut.roleProfile?.name || 'N/A',
      })),
      pendingInvitations: invitations.map(inv => ({
        id: inv.id,
        email: inv.email,
        expiresAt: inv.expiresAt,
      }))
    };
  }

  async listRoles(tenantId: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.prisma.client.roleProfile.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        description: true,
      }
    });
  }

  async inviteUser(email: string, roleProfileId: string, tenantId: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID is required');

    // Check if user is already in tenant
    const existingUser = await this.prisma.client.user.findUnique({ where: { email } });
    if (existingUser) {
      const alreadyInTenant = await this.prisma.client.userTenant.findUnique({
        where: { userId_tenantId: { userId: existingUser.id, tenantId } }
      });
      if (alreadyInTenant) throw new BadRequestException('User is already in this tenant');
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.client.userInvitation.create({
      data: {
        email,
        tenantId,
        roleProfileId,
        token,
        expiresAt,
      }
    });

    await this.mailService.sendUserInvitation(email, token);

    return { message: 'Invitation sent' };
  }

  async acceptInvite(token: string, passwordHash: string, name: string) {
    const invitation = await this.prisma.client.userInvitation.findUnique({ where: { token } });
    if (!invitation) throw new NotFoundException('Invalid or expired token');

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    // Check if user exists
    let user = await this.prisma.client.user.findUnique({ where: { email: invitation.email } });

    if (!user) {
      const hashedPass = await bcrypt.hash(passwordHash, 10);
      user = await this.prisma.client.user.create({
        data: {
          email: invitation.email,
          name: name,
          password: hashedPass,
        }
      });
    }

    // Link user to tenant
    await this.prisma.client.userTenant.create({
      data: {
        userId: user.id,
        tenantId: invitation.tenantId,
        roleProfileId: invitation.roleProfileId,
      }
    });

    // Delete invitation
    await this.prisma.client.userInvitation.delete({ where: { id: invitation.id } });

    return { message: 'Invitation accepted successfully' };
  }
}
