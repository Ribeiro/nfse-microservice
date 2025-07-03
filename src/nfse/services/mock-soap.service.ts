import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class MockSoapService {
  constructor(private readonly logger: Logger) {}

  async enviar(action: string, xml: string): Promise<{ responseXml: string }> {
    this.logger.log(
      `[MockSoapService] Iniciando envio do XML com ação ${action}`
    );
    const fakeSoapResponse = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <ns2:${action}Response xmlns:ns2="http://www.ginfes.com.br">
            <outputXML><Sucesso>true</Sucesso><Numero>${this.getRandomFixedDigits(
              10
            )}</Numero></outputXML>
          </ns2:${action}Response>
        </soap:Body>
      </soap:Envelope>
    `;
    return { responseXml: fakeSoapResponse };
  }

  getRandomFixedDigits(length: number): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber.toString();
  }
}
