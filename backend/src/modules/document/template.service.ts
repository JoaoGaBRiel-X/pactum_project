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
        delimiters: { start: '{{', end: '}}' },
        parser: function (tag) {
          return {
            get: function (scope) {
              if (tag === '.') return scope;
              return tag.split('.').reduce((acc, part) => {
                return acc ? acc[part] : undefined;
              }, scope);
            }
          };
        }
      });

      doc.render(data);

      const buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      return buf;
    } catch (error: any) {
      this.logger.error('Failed to fill template', error);
      if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors.map((e: any) => e.properties.explanation || e.message).join(', ');
        throw new Error(`Existem tags inválidas ou não fechadas no seu documento Word: ${errorMessages}`);
      }
      throw error;
    }
  }
}
