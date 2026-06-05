import { Controller, Get, Param, Res, NotFoundException, Req } from '@nestjs/common';
import { StorageService } from './storage.service';
import type { Response, Request } from 'express';
import { Public } from '../../iam/decorators/public.decorator';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Public()
  @Get('/*')
  async getFile(@Req() req: Request, @Res() res: Response) {
    // Controller is at /api/storage
    // In NestJS 11 / Express 5, req.params might not capture * natively as '0'.
    // req.path inside the controller is the rest of the url
    const rawKey = req.params['0'] || req.params['*'] || req.path.replace(/^\/?(api\/)?storage\//, '');
    const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;
    if (!key) throw new NotFoundException('File key is required');
    
    try {
      const ext = key.split('.').pop()?.toLowerCase();
      if (ext === 'png') res.setHeader('Content-Type', 'image/png');
      else if (ext === 'jpg' || ext === 'jpeg') res.setHeader('Content-Type', 'image/jpeg');
      else if (ext === 'svg') res.setHeader('Content-Type', 'image/svg+xml');

      const stream = await this.storageService.getFileStream(key);
      stream.pipe(res);
    } catch (e) {
      throw new NotFoundException('File not found');
    }
  }
}
