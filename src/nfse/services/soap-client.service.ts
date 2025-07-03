import { Injectable, Logger } from '@nestjs/common';
import { writeFile, unlink, access } from 'fs/promises';
import axios from 'axios';
import * as https from 'https';
import { CertificadoService } from './certificado.service';
import { MockSoapService } from './mock-soap.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as os from 'os';
import { XsdCacheService } from './xsd-cache.service';
import { TemplateCacheService } from './template-cache.service';

const execAsync = promisify(exec);

@Injectable()
export class SoapClientService {
  constructor(
    private readonly cert: CertificadoService,
    private readonly mock: MockSoapService,
    private readonly xsdCache: XsdCacheService,
    private readonly templateCache: TemplateCacheService,
    private readonly logger: Logger, 
  ) {}

  async renderTemplate(name: string, data: any): Promise<string> {
    this.logger.log(`[SoapClientService] Iniciando carga e renderização do template ${name}`);
    const template = this.templateCache.getTemplate(name);

    if (!template) {
      throw new Error(`Template não encontrado: ${name}`);
    }

    try {
      return template(data);
    } catch (err: any) {
      this.logger.error(`[SoapClientService] Erro ao renderizar template "${name}": ${err.message}`, err.stack);
      throw new Error(`Erro ao renderizar template: ${err.message}`);
    }
  }

  async validarXsd(xml: string, schemaName: string): Promise<string> {
    const schemaPath = this.xsdCache.getSchemaPath(schemaName);
    const tempXmlPath = path.join(os.tmpdir(), `nfse-temp-${Date.now()}.xml`);

    this.logger.log(`[SoapClientService] Iniciando validação do XML contra o xsd: ${schemaPath}`);

    try {
      await access(schemaPath);
      await writeFile(tempXmlPath, xml);

      const { stderr } = await execAsync(
        `xmllint --noout --schema "${schemaPath}" "${tempXmlPath}"`
      );

      this.logger.log(`[SoapClientService] Usando schema: ${schemaPath}`);
      this.logger.debug(`[SoapClientService] Arquivo XML temporário: ${tempXmlPath}`);
      this.logger.debug(`[SoapClientService] Resultado xmllint: ${stderr?.trim()}`);

      if (stderr && !stderr.includes('validates')) {
        throw new Error(`Erro xmllint: ${stderr}`);
      }

      return xml;
    } catch (err: any) {
      const reason = err.stderr ?? err.message;
      this.logger.error(`[SoapClientService] Erro de validação XSD: ${reason}`, err.stack);
      throw new Error(
        `Erro ao validar XML com schema "${schemaPath}": ${reason}`
      );
    } finally {
      await unlink(tempXmlPath).catch(() => {
        this.logger.warn(`[SoapClientService] Falha ao remover arquivo temporário: ${tempXmlPath}`);
      });
    }
  }

  async enviar(action: string, xml: string): Promise<{ responseXml: string }> {
    this.logger.log(`[SoapClientService] Iniciando envio do XML com ação ${action}`);
    if (process.env.USE_MOCK === 'true') {
      this.logger.log(`[SoapClientService] Enviando XML com MOCK para ação ${action}`);
      return this.mock.enviar(action, xml);
    }

    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:gnf="http://www.ginfes.com.br">
        <soapenv:Header/>
        <soapenv:Body>
          <gnf:${action}>
            <gnf:xml>${xml}</gnf:xml>
          </gnf:${action}>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const agent = new https.Agent(this.cert.getPfx());

    const url = process.env.URL_GINFES;
    if (!url) {
      this.logger.error('[SoapClientService] Variável de ambiente URL_GINFES não definida');
      throw new Error('Variável de ambiente URL_GINFES não definida');
    }

    this.logger.log(`[SoapClientService] Enviando requisição SOAP para ${url} com ação ${action}`);

    const res = await axios.post(url, soapEnvelope, {
      httpsAgent: agent,
      headers: { 'Content-Type': 'text/xml' },
    });

    this.logger.debug(`[SoapClientService] Resposta SOAP recebida (${res.data?.length} bytes)`);

    return { responseXml: res.data };
  }
}