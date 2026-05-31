import { Controller, Get, Post, Body, Param, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Financial')
@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('receivables')
  @ApiOperation({ summary: 'List all receivables' })
  findAllReceivables() {
    return this.financialService.findAllReceivables();
  }

  @Post('generate-billing')
  @ApiOperation({ summary: 'Simulate cron to generate monthly billing' })
  generateBilling(@Req() req: any) {
    const userId = req.user?.id || 'system-user';
    return this.financialService.generateBilling(userId);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Register a payment manually' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('receipt'))
  registerPayment(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system-user';
    const { receivableId, amount, method } = body;
    
    if (!receivableId || !amount || !method) {
      throw new BadRequestException('Faltam campos obrigatórios: receivableId, amount, method.');
    }

    return this.financialService.registerPayment(
      receivableId,
      Number(amount),
      method,
      file?.buffer,
      file?.originalname,
      userId
    );
  }

  @Post('renegotiations')
  @ApiOperation({ summary: 'Create a debt renegotiation' })
  createRenegotiation(@Body() body: any, @Req() req: any) {
    const userId = req.user?.id || 'system-user';
    const { customerId, receivableIds, discount } = body;
    
    if (!customerId || !receivableIds || !Array.isArray(receivableIds)) {
      throw new BadRequestException('Faltam campos obrigatórios ou inválidos: customerId, receivableIds.');
    }

    return this.financialService.createRenegotiation(
      customerId,
      receivableIds,
      Number(discount || 0),
      userId
    );
  }

  @Post(':id/boleto')
  @ApiOperation({ summary: 'Upload a PDF boleto for a receivable' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('boleto'))
  uploadBoleto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system-user';
    if (!file) {
      throw new BadRequestException('O arquivo do boleto é obrigatório.');
    }

    return this.financialService.uploadBoleto(
      id,
      file.buffer,
      file.originalname,
      userId
    );
  }
}
