import { Injectable, Logger } from '@nestjs/common';
import { SignedXml } from 'xml-crypto';
import { DOMParser } from '@xmldom/xmldom';
import { select } from 'xpath';
import { CertificadoService } from './certificado.service';

@Injectable()
export class AssinaturaService {
  constructor(
    private readonly cert: CertificadoService,
    private readonly logger: Logger,
  ) {}

  async assinar(xml: string): Promise<string> {
    this.logger.log('[AssinaturaService] Iniciando assinatura do XML.');
    const { key, cert } = this.cert.getKeyAndCert();

    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const nodes = select("//*[attribute::Id]", doc as any) as Element[];

    if (!nodes || nodes.length === 0) {
      this.logger.warn("Nenhum elemento com atributo 'Id' encontrado.");
      throw new Error("Nenhum elemento com atributo 'Id' encontrado.");
    }

    const node = nodes[0];
    const id = node.getAttribute('Id');
    const tagName = node.localName || node.nodeName;

    if (!id || !tagName) {
      this.logger.error("Elemento com 'Id' inválido.");
      throw new Error("Elemento com 'Id' inválido.");
    }

    this.logger.debug(`Assinando XML com tag <${tagName}> e Id="${id}"`);

    const signed = new SignedXml();
    signed.signingKey = key;

    signed.keyInfoProvider = {
      getKeyInfo: () =>
        `<X509Data><X509Certificate>${cert}</X509Certificate></X509Data>`,
    };

    (signed as any).canonicalizationAlgorithm =
      'http://www.w3.org/2001/10/xml-exc-c14n#';

    signed.addReference({
      uri: `#${id}`,
      xpath: `//*[local-name(.)='${tagName}']`,
      transforms: ['http://www.w3.org/2000/09/xmldsig#enveloped-signature'],
      digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
    } as any);

    (signed as any).computeSignature(xml, {
      location: {
        reference: `//*[local-name(.)='${tagName}']`,
        action: 'append',
      },
    });

    this.logger.log(`XML assinado com sucesso.`);

    return signed.getSignedXml();
  }
}
