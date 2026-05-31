import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CorporateGroupService } from './corporate-group.service';
import { CreateCorporateGroupDto } from './dto/create-corporate-group.dto';
import { UpdateCorporateGroupDto } from './dto/update-corporate-group.dto';

@ApiTags('Corporate Groups')
@ApiBearerAuth()
@Controller('corporate-groups')
export class CorporateGroupController {
  constructor(private readonly corporateGroupService: CorporateGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo Grupo Econômico' })
  create(@Body() createCorporateGroupDto: CreateCorporateGroupDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.corporateGroupService.create(createCorporateGroupDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os Grupos Econômicos do locatário' })
  findAll() {
    return this.corporateGroupService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar detalhes de um Grupo Econômico' })
  findOne(@Param('id') id: string) {
    return this.corporateGroupService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um Grupo Econômico' })
  update(@Param('id') id: string, @Body() updateCorporateGroupDto: UpdateCorporateGroupDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.corporateGroupService.update(id, updateCorporateGroupDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um Grupo Econômico' })
  remove(@Param('id') id: string) {
    return this.corporateGroupService.remove(id);
  }
}
