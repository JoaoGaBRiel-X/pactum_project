import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AdjustmentService } from './adjustment.service';

@Controller('adjustments')
export class AdjustmentController {
  constructor(private readonly adjustmentService: AdjustmentService) {}

  @Post('indexes')
  createIndex(@Body() data: { name: string; description?: string }, @Req() req: any) {
    const userId = req.headers['x-user-id'] || 'system-user';
    return this.adjustmentService.createIndex(data, userId as string);
  }

  @Get('indexes')
  findAllIndexes() {
    return this.adjustmentService.findAllIndexes();
  }

  @Post('rates')
  addRate(@Body() data: { indexId: string; competence: string; accumulatedRate: number }) {
    return this.adjustmentService.addRate(data.indexId, data.competence, data.accumulatedRate);
  }

  @Post('contracts/:id/manual')
  applyManualAdjustment(@Param('id') id: string, @Body() data: { percentage: number }, @Req() req: any) {
    const userId = req.headers['x-user-id'] || 'system-user';
    return this.adjustmentService.applyManualAdjustment(id, data.percentage, userId as string);
  }

  @Post('run-automatic')
  runAutomaticAdjustments(@Req() req: any) {
    const userId = req.headers['x-user-id'] || 'system-user';
    return this.adjustmentService.runAutomaticAdjustmentsForTenant(userId as string);
  }

  @Post('sync-bacen')
  syncBacenRates(@Req() req: any) {
    const userId = req.headers['x-user-id'] || 'system-user';
    return this.adjustmentService.syncBacenRatesForTenant(userId as string);
  }
}
