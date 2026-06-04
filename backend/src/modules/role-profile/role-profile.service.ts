import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleProfileDto } from './dto/create-role-profile.dto';
import { UpdateRoleProfileDto } from './dto/update-role-profile.dto';

@Injectable()
export class RoleProfileService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createDto: CreateRoleProfileDto) {
    return this.prisma.client.roleProfile.create({
      data: {
        ...createDto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.client.roleProfile.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const roleProfile = await this.prisma.client.roleProfile.findFirst({
      where: { id, tenantId },
    });

    if (!roleProfile) {
      throw new NotFoundException(`Perfil de acesso não encontrado.`);
    }

    return roleProfile;
  }

  async update(tenantId: string, id: string, updateDto: UpdateRoleProfileDto) {
    await this.findOne(tenantId, id); // Ensure it exists and belongs to tenant

    return this.prisma.client.roleProfile.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id); // Ensure it exists and belongs to tenant

    return this.prisma.client.roleProfile.delete({
      where: { id },
    });
  }
}
