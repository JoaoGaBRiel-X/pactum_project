import { Injectable, Logger } from '@nestjs/common';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  async fillTemplate(templateBuffer: Buffer, data: Record<string, any>): Promise<Buffer> {
    try {
      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render(data);

      const buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      return buf;
    } catch (error) {
      this.logger.error('Failed to fill template', error);
      throw error;
    }
  }
}
