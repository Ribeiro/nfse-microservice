import { Injectable, Logger } from "@nestjs/common";
import { AssinaturaService } from "./assinatura.service";
import { SoapClientService } from "./soap-client.service";
import { ConsultarLoteDto } from "../dtos/consultar-lote.dto";
import { ConsultarRpsDto } from "../dtos/consultar-rps.dto";
import { ConsultarNumeroDto } from "../dtos/consultar-numero.dto";
import { CancelarNfseDto } from "../dtos/cancelar-nfse.dto";
import { EnviarLoteDto } from "../dtos/enviar-lote.dto";
import { EmitirRpsDto } from "../dtos/emitir-rps.dto";

@Injectable()
export class NfseService {
  constructor(
    private readonly assinaturaService: AssinaturaService,
    private readonly soapClientService: SoapClientService,
    private readonly logger: Logger,
  ) {}

  async emitirRps(dto: EmitirRpsDto) {
    this.logger.log(`[NfseService] Iniciando emissão de RPS para o lote ${dto.numeroLote}`);
    const xml = await this.soapClientService.renderTemplate("emitir-rps.ejs", dto);
    const xmlVal = await this.soapClientService.validarXsd(xml, "servico_enviar_lote_rps_envio_v03"); // ou esquema específico
    const xmlAssinado = await this.assinaturaService.assinar(xmlVal);
    const { responseXml } = await this.soapClientService.enviar(
      "EnviarLoteRps",
      xmlAssinado
    );
    this.logger.log('[NfseService] RPS emitido com sucesso.');
    return { xmlAssinado, responseXml };
  }

  async consultarLote(dto: ConsultarLoteDto) {
    this.logger.log(`[NfseService] Consultando lote ${dto.protocolo}`);
    const xml = await this.soapClientService.renderTemplate("consultar-lote.ejs", dto);
    const xmlVal = await this.soapClientService.validarXsd(xml, "servico_consultar_situacao_lote_rps_envio_v03");
    const signedXml = await this.assinaturaService.assinar(xmlVal);
    const { responseXml } = await this.soapClientService.enviar(
      "ConsultarSituacaoLoteRps",
      signedXml
    );
    return { requestXml: signedXml, responseXml };
  }

  async consultarPorRps(dto: ConsultarRpsDto) {
    this.logger.log(`[NfseService] Consultando NFS-e por RPS ${JSON.stringify(dto)}`);
    const xml = await this.soapClientService.renderTemplate("consultar-rps.ejs", dto);
    const xmlVal = await this.soapClientService.validarXsd(xml, "servico_consultar_nfse_rps_envio_v03");
    const signedXml = await this.assinaturaService.assinar(xmlVal);
    const { responseXml } = await this.soapClientService.enviar(
      "ConsultarNfsePorRps",
      signedXml
    );
    return { requestXml: signedXml, responseXml };
  }

  async consultarPorNumero(dto: ConsultarNumeroDto) {
    this.logger.log(`[NfseService] Consultando NFS-e por número ${JSON.stringify(dto)}`);
    const xml = await this.soapClientService.renderTemplate("consultar-numero.ejs", dto);
    const xmlVal = await this.soapClientService.validarXsd(xml, "servico_consultar_nfse_envio_v03");
    const signedXml = await this.assinaturaService.assinar(xmlVal);
    const { responseXml } = await this.soapClientService.enviar("ConsultarNfse", signedXml);
    return { requestXml: signedXml, responseXml };
  }

  async cancelarNfse(dto: CancelarNfseDto) {
    this.logger.log(`[NfseService] Cancelando NFS-e ${dto.numeroNfse}`);
    const xml = await this.soapClientService.renderTemplate("cancelar-nfse.ejs", dto);
    const xmlVal = await this.soapClientService.validarXsd(xml, "servico_cancelar_nfse_envio_v03");
    const signedXml = await this.assinaturaService.assinar(xmlVal);
    const { responseXml } = await this.soapClientService.enviar("CancelarNfse", signedXml);
    this.logger.log(`[NfseService] NFS-e ${dto.numeroNfse} cancelada com sucesso.`);
    return { requestXml: signedXml, responseXml };
  }

  async enviarLote(dto: EnviarLoteDto) {
    this.logger.log(`[NfseService] Enviando lote ${dto.numeroLote} com ${dto.rps.length} RPS`);
    // Renderizar todos os RPS individualmente (usando o mesmo template da emissão avulsa)
    const rpsXmlList = await Promise.all(
      dto.rps.map((rps: EmitirRpsDto) => {
        return this.soapClientService.renderTemplate("emitir-rps.ejs", {
          ...rps,
          prestadorCnpj: dto.prestadorCnpj,
          inscricaoMunicipal: dto.inscricaoMunicipal,
          naturezaOperacao: rps.naturezaOperacao,
          regimeEspecialTributacao: rps.regimeEspecialTributacao,
          optanteSimplesNacional: rps.optanteSimplesNacional,
          incentivadorCultural: rps.incentivadorCultural,
          servico: rps.servico,
          tomador: rps.tomador,
        });
      })
    );

    const listaRpsXml = rpsXmlList.join("\n");

    // Renderiza o XML do Lote
    const loteXml = await this.soapClientService.renderTemplate("enviar-lote.ejs", {
      prestadorCnpj: dto.prestadorCnpj,
      inscricaoMunicipal: dto.inscricaoMunicipal,
      numeroLote: dto.numeroLote,
      quantidadeRps: dto.rps.length,
      listaRpsXml: listaRpsXml,
    });

    // Valida contra o schema XSD (opcional, pode ser desabilitado em produção)
    const xmlValidado = await this.soapClientService.validarXsd(
      loteXml,
      "EnviarLoteRpsEnvio"
    );

    // Assina o XML
    const xmlAssinado = await this.assinaturaService.assinar(xmlValidado);

    // Envia o XML assinado via SOAP
    const { responseXml } = await this.soapClientService.enviar(
      "EnviarLoteRps",
      xmlAssinado
    );

    this.logger.log(`[NfseService] Lote ${dto.numeroLote} enviado com sucesso.`);
    return { xmlAssinado, responseXml };
  }
}