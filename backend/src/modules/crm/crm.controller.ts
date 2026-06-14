import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { ConvertOpportunityDto } from './dto/convert-opportunity.dto';
import { JwtAuthGuard } from '../../iam/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../iam/guards/permissions.guard';
import { RequirePermissions } from '../../iam/decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
@ApiTags('crm')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // --- LEADS ---

  @RequirePermissions('crm:manage')
  @ApiOperation({ summary: 'Criar um novo lead' })
  @Post('leads')
  createLead(@Body() createLeadDto: CreateLeadDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.crmService.createLead(createLeadDto, userId);
  }

  @RequirePermissions('crm:read')
  @ApiOperation({ summary: 'Listar todos os leads' })
  @Get('leads')
  findAllLeads() {
    return this.crmService.findAllLeads();
  }

  @RequirePermissions('crm:read')
  @ApiOperation({ summary: 'Obter detalhes de um lead' })
  @Get('leads/:id')
  findOneLead(@Param('id') id: string) {
    return this.crmService.findOneLead(id);
  }

  @RequirePermissions('crm:manage')
  @ApiOperation({ summary: 'Atualizar um lead' })
  @Patch('leads/:id')
  updateLead(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.crmService.updateLead(id, updateLeadDto, userId);
  }

  @RequirePermissions('crm:manage')
  @ApiOperation({ summary: 'Excluir um lead' })
  @Delete('leads/:id')
  removeLead(@Param('id') id: string) {
    return this.crmService.removeLead(id);
  }

  // --- PIPELINES ---

  @RequirePermissions('crm:read')
  @ApiOperation({ summary: 'Obter o pipeline ativo (funil de vendas)' })
  @Get('pipeline')
  getActivePipeline(@Req() req: any) {
    const userId = req.user?.userId;
    return this.crmService.getActivePipeline(userId);
  }

  // --- OPPORTUNITIES ---

  @RequirePermissions('crm:manage')
  @ApiOperation({ summary: 'Criar uma nova oportunidade' })
  @Post('opportunities')
  createOpportunity(@Body() createOpportunityDto: CreateOpportunityDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.crmService.createOpportunity(createOpportunityDto, userId);
  }
  @RequirePermissions('crm:manage')
  @ApiOperation({ summary: 'Mover uma oportunidade para outro estágio' })
  @Patch('opportunities/:id/move')
  moveOpportunity(@Param('id') id: string, @Body('stageId') stageId: string, @Req() req: any) {
    const userId = req.user?.userId;
    return this.crmService.moveOpportunity(id, stageId, userId);
  }

  @RequirePermissions('crm:manage')
  @ApiOperation({ summary: 'Converter uma Oportunidade Ganha em Cliente e Contrato' })
  @Post('opportunities/:id/convert')
  convertOpportunity(
    @Param('id') id: string,
    @Body() dto: ConvertOpportunityDto,
    @Req() req: any
  ) {
    const userId = req.user?.userId;
    return this.crmService.convertOpportunity(id, dto, userId);
  }
}
