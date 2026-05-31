import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
const FormData = require('form-data');

@Injectable()
export class GotenbergService {
  private readonly logger = new Logger(GotenbergService.name);
  private readonly gotenbergUrl = process.env.GOTENBERG_URL || 'http://localhost:3001';

  async convertDocxToPdf(buffer: Buffer, filename: string): Promise<Buffer> {
    try {
      const form = new FormData();
      form.append('files', buffer, { filename });
      const response = await axios.post(`${this.gotenbergUrl}/forms/libreoffice/convert`, form, {
        headers: form.getHeaders(),
        responseType: 'arraybuffer'
      });

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(`Failed to convert ${filename} to PDF`, error);
      throw error;
    }
  }
}
