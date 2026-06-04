import { Controller, Post, Body, Param, Req, Res, UseInterceptors, UploadedFile, Get, Delete } from '@nestjs/common';
import type { Response } from 'express';
// Removed fs import
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
    @Body('category') category: string,
    @Req() req: any
  ) {
    console.log('Upload template hit:', { name, category, file: !!file });
    const userId = req.user?.userId || 'system-user';
    return this.documentService.uploadTemplate(file, name, description, category, userId);
  }

  @Get('templates')
  async getTemplates() {
    // This is simple list endpoint
    return this.documentService.getTemplates();
  }

  @Post('templates/:id/status')
  async toggleTemplateStatus(
    @Param('id') templateId: string,
    @Body('isActive') isActive: boolean
  ) {
    return this.documentService.toggleTemplateStatus(templateId, isActive);
  }

  @Get('templates/:id/download')
  async downloadTemplate(@Param('id') templateId: string, @Res() res: Response) {
    const { stream, name } = await this.documentService.getTemplateStream(templateId);
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="template_${name}.docx"`,
    });

    stream.pipe(res);
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') templateId: string) {
    return this.documentService.deleteTemplate(templateId);
  }

  @Post('generate')
  async generateContract(
    @Body('contractId') contractId: string,
    @Body('templateId') templateId: string,
    @Req() req: any
  ) {
    const userId = req.user?.userId || 'system-user';
    const tenantId = req.headers['x-tenant-id'];
    return this.documentService.generateContractDocument(contractId, templateId, userId, tenantId);
  }

  @Post(':id/manual-sign')
  async manualSign(@Param('id') documentId: string, @Req() req: any) {
    const userId = req.user?.userId || 'system-user';
    return this.documentService.markAsManuallySigned(documentId, userId);
  }

  @Get(':id/download')
  async downloadDocument(@Param('id') documentId: string, @Res() res: Response) {
    const { stream, id } = await this.documentService.getDocumentStream(documentId);
    
    // Set headers for download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${id}.pdf"`,
    });

    stream.pipe(res);
  }

  @Delete(':id')
  async deleteDocument(@Param('id') documentId: string) {
    return this.documentService.deleteDocument(documentId);
  }
}
