import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { RoleProfileService } from './role-profile.service';
import { CreateRoleProfileDto } from './dto/create-role-profile.dto';
import { UpdateRoleProfileDto } from './dto/update-role-profile.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../../iam/decorators/permissions.decorator';

@ApiTags('Role Profiles')
@ApiBearerAuth()
@Controller('roles')
export class RoleProfileController {
  constructor(private readonly roleProfileService: RoleProfileService) {}

  @Post()
  @RequirePermissions('settings:manage')
  @ApiOperation({ summary: 'Cria um novo perfil de acesso' })
  create(@Req() req: any, @Body() createRoleProfileDto: CreateRoleProfileDto) {
    const tenantId = req.tenantContext.tenantId;
    return this.roleProfileService.create(tenantId, createRoleProfileDto);
  }

  @Get()
  @RequirePermissions('settings:manage', 'users:manage')
  @ApiOperation({ summary: 'Lista os perfis de acesso do locatário' })
  findAll(@Req() req: any) {
    const tenantId = req.tenantContext.tenantId;
    return this.roleProfileService.findAll(tenantId);
  }

  @Get(':id')
  @RequirePermissions('settings:manage', 'users:manage')
  @ApiOperation({ summary: 'Obtém um perfil de acesso pelo ID' })
  findOne(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.tenantContext.tenantId;
    return this.roleProfileService.findOne(tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions('settings:manage')
  @ApiOperation({ summary: 'Atualiza um perfil de acesso' })
  update(@Req() req: any, @Param('id') id: string, @Body() updateRoleProfileDto: UpdateRoleProfileDto) {
    const tenantId = req.tenantContext.tenantId;
    return this.roleProfileService.update(tenantId, id, updateRoleProfileDto);
  }

  @Delete(':id')
  @RequirePermissions('settings:manage')
  @ApiOperation({ summary: 'Remove um perfil de acesso' })
  remove(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.tenantContext.tenantId;
    return this.roleProfileService.remove(tenantId, id);
  }
}
