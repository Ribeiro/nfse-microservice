import { Controller, Post, Body, Get, Param, Query } from "@nestjs/common";
import { NfseService } from "../services/nfse.service";
import { EmitirRpsDto } from "../dtos/emitir-rps.dto";
import { EnviarLoteDto } from "../dtos/enviar-lote.dto";
import { CancelarNfseDto } from "../dtos/cancelar-nfse.dto";
import { ConsultarRpsDto } from "../dtos/consultar-rps.dto";
import { ConsultarNumeroDto } from "../dtos/consultar-numero.dto";
import { ConsultarLoteDto } from "../dtos/consultar-lote.dto";

@Controller("nfse")
export class NfseController {
  constructor(private readonly nfseService: NfseService) {}

  @Post("rps")
  emitirRps(@Body() dto: EmitirRpsDto) {
    return this.nfseService.emitirRps(dto);
  }

  @Post("lote")
  enviarLote(@Body() dto: EnviarLoteDto) {
    return this.nfseService.enviarLote(dto);
  }

  @Get("lote/:protocolo")
  consultarLote(
    @Param("protocolo") protocolo: string,
    @Query("cnpj") cnpj: string,
    @Query("im") im: string,
  ) {
    const dto: ConsultarLoteDto = {
      protocolo,
      prestadorCnpj: cnpj,
      inscricaoMunicipal: im,
    };
    return this.nfseService.consultarLote(dto);
  }

  @Get("rps")
  consultarPorRps(@Query() query: Record<string, string>) {
    const dto: ConsultarRpsDto = {
      prestadorCnpj: query.cnpj,
      inscricaoMunicipal: query.im,
      numero: query.numero,
      serie: query.serie,
      tipo: query.tipo,
    };
    return this.nfseService.consultarPorRps(dto);
  }

  @Get("nfse/:numero")
  consultarPorNumero(
    @Param("numero") numero: string,
    @Query("cnpj") cnpj: string,
    @Query("im") im: string,
  ) {
    const dto: ConsultarNumeroDto = {
      numero,
      prestadorCnpj: cnpj,
      inscricaoMunicipal: im,
    };
    return this.nfseService.consultarPorNumero(dto);
  }

  @Post("cancelar")
  cancelar(@Body() dto: CancelarNfseDto) {
    return this.nfseService.cancelarNfse(dto);
  }
}
