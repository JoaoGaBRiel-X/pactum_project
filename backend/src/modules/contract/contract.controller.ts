import { Controller, Get, Post, Body, Param, Req, Patch, Put, Delete } from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Contracts')
@Controller('contracts')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
  ) {}

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

  @Post(':id/amend')
  @ApiOperation({ summary: 'Create a pending amendment for an active contract' })
  amendContract(
    @Param('id') id: string,
    @Body() amendDto: UpdateContractDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system-user';
    return this.contractService.amendContract(id, amendDto, userId);
  }

  @Post(':id/amend/apply')
  @ApiOperation({ summary: 'Apply the pending amendment and activate the new terms' })
  applyAmendment(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'system-user';
    return this.contractService.applyAmendment(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a draft contract' })
  remove(@Param('id') id: string) {
    return this.contractService.remove(id);
  }
}
