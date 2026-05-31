import { Controller, Get, Post, Body, Param, Req, Patch, Put, Delete } from '@nestjs/common';
import { ContractService } from './contract.service';
import { DocumentService } from './document/document.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Contracts')
@Controller('contracts')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private readonly documentService: DocumentService,
  ) {}

  @Post(':id/generate-document')
  @ApiOperation({ summary: 'Generate DOCX for the contract' })
  async generateDocument(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'system-user';
    const path = await this.documentService.generateContractDocument(id, userId);
    return { message: 'Document generated successfully', path };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new contract' })
  create(@Body() createContractDto: CreateContractDto, @Req() req: any) {
    const userId = req.user?.id || 'system-user';
    return this.contractService.create(createContractDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all contracts' })
  findAll() {
    return this.contractService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract details by id' })
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update contract status' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateContractStatusDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system-user';
    return this.contractService.updateStatus(id, updateStatusDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a draft contract' })
  update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system-user';
    return this.contractService.update(id, updateContractDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a draft contract' })
  remove(@Param('id') id: string) {
    return this.contractService.remove(id);
  }
}
