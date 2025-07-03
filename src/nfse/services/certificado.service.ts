import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as forge from "node-forge";

@Injectable()
export class CertificadoService {
  private readonly pfxBuffer!: Buffer;
  private readonly passphrase!: string;

  constructor() {
    if (!process.env.PATH_PFX || !process.env.PASS_PFX) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Certificado não carregado. Rodando em modo mock.");
        return;
      }
      throw new Error("Variáveis PATH_PFX e PASS_PFX devem estar definidas");
    }

    this.pfxBuffer = fs.readFileSync(process.env.PATH_PFX);
    this.passphrase = process.env.PASS_PFX;
  }

  getPfx() {
    return {
      pfx: this.pfxBuffer,
      passphrase: this.passphrase,
    };
  }

  getKeyAndCert(): { key: string; cert: string } {
    const p12Asn1 = forge.asn1.fromDer(this.pfxBuffer.toString("binary"));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, this.passphrase);

    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certBag = certBags[forge.pki.oids.certBag]?.[0];
    if (!certBag?.cert) {
      throw new Error("Certificado não encontrado no arquivo .pfx");
    }

    const keyBags = p12.getBags({ bagType: forge.pki.oids.keyBag });
    const keyBag = keyBags[forge.pki.oids.keyBag]?.[0];
    if (!keyBag?.key) {
      throw new Error("Chave privada não encontrada no arquivo .pfx");
    }

    const certPem = forge.pki.certificateToPem(certBag.cert);
    const keyPem = forge.pki.privateKeyToPem(keyBag.key);

    // Remove cabeçalhos do certificado PEM para uso em XML
    const certBase64 = certPem
      .replace("-----BEGIN CERTIFICATE-----", "")
      .replace("-----END CERTIFICATE-----", "")
      .replace(/\r?\n|\r/g, "");

    return {
      key: keyPem,
      cert: certBase64,
    };
  }
}
