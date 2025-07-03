import { Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NfseController } from './controllers/nfse.controller';
import { NfseService } from './services/nfse.service';
import { SoapClientService } from './services/soap-client.service';
import { AssinaturaService } from './services/assinatura.service';
import { CertificadoService } from './services/certificado.service';
import { MockSoapService } from './services/mock-soap.service';
import { MockAssinaturaService } from './services/mock-assinatura.service';
import { XsdCacheService } from './services/xsd-cache.service';
import { TemplateCacheService } from './services/template-cache.service';
import { HealthController } from '../health/controllers/health.controller';

@Module({
  controllers: [NfseController, HealthController],
  providers: [
    Logger,
    CertificadoService,
    MockAssinaturaService,

    {
      provide: MockSoapService,
      useFactory: (logger: Logger) => new MockSoapService(logger),
      inject: [Logger],
    },

    {
      provide: XsdCacheService,
      useFactory: (logger: Logger) => new XsdCacheService(logger),
      inject: [Logger],
    },

    {
      provide: TemplateCacheService,
      useFactory: (logger: Logger) => new TemplateCacheService(logger),
      inject: [Logger],
    },

    {
      provide: SoapClientService,
      useFactory: (
        cert: CertificadoService,
        mock: MockSoapService,
        xsdCache: XsdCacheService,
        templateCache: TemplateCacheService,
        logger: Logger,
      ) => new SoapClientService(cert, mock, xsdCache, templateCache, logger),
      inject: [
        CertificadoService,
        MockSoapService,
        XsdCacheService,
        TemplateCacheService,
        Logger,
      ],
    },

    {
      provide: AssinaturaService,
      useFactory: (
        config: ConfigService,
        cert: CertificadoService,
        logger: Logger,
      ) => {
        const useMock = config.get('USE_MOCK') === 'true';
        return useMock
          ? new MockAssinaturaService(logger)
          : new AssinaturaService(cert, logger);
      },
      inject: [ConfigService, CertificadoService, Logger],
    },

    {
      provide: NfseService,
      useFactory: (
        assinatura: AssinaturaService,
        soapClient: SoapClientService,
        logger: Logger,
      ) => new NfseService(assinatura, soapClient, logger),
      inject: [AssinaturaService, SoapClientService, Logger],
    },
  ],
})
export class NfseModule {}
