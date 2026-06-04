import { Controller, Get, Post, Body, Param, Req, Patch, Put, Delete } from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../../iam/decorators/permissions.decorator';

@ApiTags('Contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
  ) {}

  @Post()
  @RequirePermissions('contracts:create')
  @ApiOperation({ summary: 'Create a new contract' })
  create(@Body() createContractDto: CreateContractDto, @Req() req: any) {
    const userId = req.user?.userId;
    const tenantId = req.tenantContext?.tenantId;
    return this.contractService.create(createContractDto, userId, tenantId);
  }

  @Get()
  @RequirePermissions('contracts:read', 'contracts:read_own')
  @ApiOperation({ summary: 'List all contracts' })
  findAll(@Req() req: any) {
    const userId = req.user?.userId;
    const permissions = req.tenantContext?.permissions || [];
    return this.contractService.findAll(userId, permissions);
  }

  @Get(':id')
  @RequirePermissions('contracts:read', 'contracts:read_own')
  @ApiOperation({ summary: 'Get contract details by id' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId;
    const permissions = req.tenantContext?.permissions || [];
    return this.contractService.findOne(id, userId, permissions);
  }

  @Patch(':id/status')
  @RequirePermissions('contracts:update')
  @ApiOperation({ summary: 'Update contract status' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateContractStatusDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    const tenantId = req.tenantContext?.tenantId;
    return this.contractService.updateStatus(id, updateStatusDto, userId, tenantId);
  }

  @Put(':id')
  @RequirePermissions('contracts:update')
  @ApiOperation({ summary: 'Update a draft contract' })
  update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    const permissions = req.tenantContext?.permissions || [];
    return this.contractService.update(id, updateContractDto, userId, permissions);
  }

  @Post(':id/amend')
  @RequirePermissions('contracts:update')
  @ApiOperation({ summary: 'Create a pending amendment for an active contract' })
  amendContract(
    @Param('id') id: string,
    @Body() amendDto: UpdateContractDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    const permissions = req.tenantContext?.permissions || [];
    return this.contractService.amendContract(id, amendDto, userId, permissions);
  }

  @Post(':id/amend/apply')
  @RequirePermissions('contracts:approve_discounts') // Only managers can apply an amendment directly? Or normally contracts:update is fine, depending on the discount.
  @ApiOperation({ summary: 'Apply the pending amendment and activate the new terms' })
  applyAmendment(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId;
    const tenantId = req.tenantContext?.tenantId;
    return this.contractService.applyAmendment(id, userId, tenantId);
  }

  @Delete(':id')
  @RequirePermissions('contracts:delete')
  @ApiOperation({ summary: 'Delete a draft contract' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId;
    const permissions = req.tenantContext?.permissions || [];
    return this.contractService.remove(id, userId, permissions);
  }

  // New endpoint for approving discounts specifically
  @Post(':id/approve-discount')
  @RequirePermissions('contracts:approve_discounts')
  @ApiOperation({ summary: 'Aprovar um contrato que ultrapassou o teto de desconto' })
  approveDiscount(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId;
    return this.contractService.approveDiscount(id, userId);
  }

  @Post(':id/reject-discount')
  @RequirePermissions('contracts:approve_discounts')
  @ApiOperation({ summary: 'Rejeitar um contrato que ultrapassou o teto de desconto' })
  rejectDiscount(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId;
    return this.contractService.rejectDiscount(id, userId);
  }
}

