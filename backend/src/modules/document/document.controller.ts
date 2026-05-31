import { Controller, Post, Body, Param, Req, UseInterceptors, UploadedFile, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('templates')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTemplate(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @Body('description') description: string,
    @Req() req: any
  ) {
    const userId = req.headers['x-user-id'] || 'system-user';
    return this.documentService.uploadTemplate(file, name, description, userId);
  }

  @Get('templates')
  async getTemplates(@Req() req: any) {
    const userId = req.headers['x-user-id'] || 'system-user';
    // This is simple list endpoint
    return this.documentService.getTemplates();
  }

  @Post('generate')
  async generateContract(
    @Body('contractId') contractId: string,
    @Body('templateId') templateId: string,
    @Req() req: any
  ) {
    const userId = req.headers['x-user-id'] || 'system-user';
    return this.documentService.generateContractDocument(contractId, templateId, userId);
  }

  @Post(':id/manual-sign')
  async manualSign(@Param('id') documentId: string, @Req() req: any) {
    const userId = req.headers['x-user-id'] || 'system-user';
    return this.documentService.markAsManuallySigned(documentId, userId);
  }
}
