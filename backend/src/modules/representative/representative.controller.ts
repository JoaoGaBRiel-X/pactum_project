import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { RepresentativeService } from './representative.service';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';
import { JwtAuthGuard } from '../../iam/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../iam/guards/permissions.guard';
import { RequirePermissions } from '../../iam/decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('representatives')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('representatives')
export class RepresentativeController {
  constructor(private readonly representativeService: RepresentativeService) {}

  @RequirePermissions('representatives:manage')
  @ApiOperation({ summary: 'Criar representante' })
  @Post()
  create(@Body() createRepresentativeDto: CreateRepresentativeDto, @Req() req: any) {
    const userId = req.user?.userId;
    // Em uma refatoração futura, userId pode ser passado ao service para auditoria
    return this.representativeService.create(createRepresentativeDto);
  }

  @RequirePermissions('representatives:read')
  @ApiOperation({ summary: 'Listar todos os representantes' })
  @Get()
  findAll() {
    return this.representativeService.findAll();
  }

  @RequirePermissions('representatives:read')
  @ApiOperation({ summary: 'Buscar representante por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.representativeService.findOne(id);
  }

  @RequirePermissions('representatives:read')
  @ApiOperation({ summary: 'Extrato de comissões do representante' })
  @Get(':id/commissions')
  getCommissionStatement(
    @Param('id') id: string,
    @Query('competence') competence?: string,
  ) {
    return this.representativeService.getCommissionStatement(id, competence);
  }

  @RequirePermissions('representatives:manage')
  @ApiOperation({ summary: 'Atualizar representante' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRepresentativeDto: UpdateRepresentativeDto) {
    return this.representativeService.update(id, updateRepresentativeDto);
  }

  @RequirePermissions('representatives:manage')
  @ApiOperation({ summary: 'Excluir representante' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.representativeService.remove(id);
  }
}
