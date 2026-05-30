import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { ContractService } from './contract.service';
import { DocumentService } from './document/document.service';
import { CreateContractDto } from './dto/create-contract.dto';
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
}
