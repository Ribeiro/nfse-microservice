import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MockAssinaturaService {
  constructor(private readonly logger: Logger) {}

  async assinar(xml: string): Promise<string> {
    this.logger.log('[MockAssinaturaService] Iniciando assinatura simualada do XML.');
    return `<!-- XML ASSINADO MOCK -->\n${xml}`;
  }
}