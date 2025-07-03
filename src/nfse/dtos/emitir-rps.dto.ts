import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoRps {
  RPS = '1',
  NFConjugada = '2',
  Cupom = '3',
}

export enum NaturezaOperacao {
  TributacaoNoMunicipio = '1',
  TributacaoForaMunicipio = '2',
  Isencao = '3',
  Imune = '4',
  ExigibilidadeSuspensa = '5',
}

export enum RegimeEspecialTributacao {
  MicroempresaMunicipal = '1',
  Estimativa = '2',
  SociedadeProfissionais = '3',
  Cooperativa = '4',
  MEI = '5',
  MEESimples = '6'
}

export class TomadorDto {
  @IsString()
  cpfCnpj!: string;

  @IsString()
  razaoSocial!: string;

  @IsOptional()
  @IsString()
  inscricaoMunicipal?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsOptional()
  @IsString()
  bairro?: string;

  @IsOptional()
  @IsString()
  codigoMunicipio?: string;

  @IsOptional()
  @IsString()
  uf?: string;

  @IsOptional()
  @IsString()
  cep?: string;
}

export class ServicoDto {
  @IsString()
  itemListaServico!: string;

  @IsString()
  codigoTributacaoMunicipio!: string;

  @IsString()
  discriminacao!: string;

  @IsString()
  codigoMunicipio!: string;

  @IsNumber()
  valorServicos!: number;

  @IsOptional()
  @IsNumber()
  valorDeducoes?: number;

  @IsOptional()
  @IsNumber()
  valorPis?: number;

  @IsOptional()
  @IsNumber()
  valorCofins?: number;

  @IsOptional()
  @IsNumber()
  valorInss?: number;

  @IsOptional()
  @IsNumber()
  valorIr?: number;

  @IsOptional()
  @IsNumber()
  valorCsll?: number;

  @IsOptional()
  @IsNumber()
  outrasRetencoes?: number;

  @IsOptional()
  @IsNumber()
  valorIss?: number;

  @IsOptional()
  @IsNumber()
  aliquota!: number;

  @IsOptional()
  @IsNumber()
  descontoIncondicionado?: number;

  @IsOptional()
  @IsNumber()
  descontoCondicionado?: number;
}

export class EmitirRpsDto {
  // Identificação do RPS
  @IsString()
  numero!: string;

  @IsString()
  serie!: string;

  @IsEnum(TipoRps)
  tipo!: TipoRps;

  @IsDateString()
  dataEmissao!: string;

  // Dados do Prestador
  @IsString()
  prestadorCnpj!: string;

  @IsString()
  inscricaoMunicipal!: string;

  // Informações do Serviço
  @ValidateNested()
  @Type(() => ServicoDto)
  servico!: ServicoDto;

  // Informações do Tomador
  @ValidateNested()
  @Type(() => TomadorDto)
  tomador!: TomadorDto;

  // Tributos
  @IsEnum(NaturezaOperacao)
  naturezaOperacao!: NaturezaOperacao;

  @IsEnum(RegimeEspecialTributacao)
  regimeEspecialTributacao!: RegimeEspecialTributacao;

  @IsNumber()
  optanteSimplesNacional!: number; // 1 = Sim, 2 = Não

  @IsNumber()
  incentivadorCultural!: number; // 1 = Sim, 2 = Não

  @IsString()
  numeroLote: string = Date.now().toString();

  @IsNumber()
  quantidadeRps: number = 1;

}
