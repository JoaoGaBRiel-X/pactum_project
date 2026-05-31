import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ClicksignService {
  private readonly logger = new Logger(ClicksignService.name);

  // Stub for Clicksign API Integration
  async sendDocumentForSignature(documentBuffer: Buffer, fileName: string, signerInfo: { name: string, email: string }) {
    this.logger.log(`Simulating sending ${fileName} to Clicksign for ${signerInfo.name} (${signerInfo.email})`);
    
    // Na vida real:
    // 1. Upload Documento -> /api/v1/documents -> Retorna Document Key
    // 2. Criar Signatário -> /api/v1/signers -> Retorna Signer Key
    // 3. Vincular (List) -> /api/v1/lists -> Retorna List Key
    // 4. Notificar -> /api/v1/notifications -> Envia Email
    
    return {
      documentKey: `mock-doc-key-${Date.now()}`,
      signerKey: `mock-signer-key-${Date.now()}`,
      status: 'pending'
    };
  }
}
