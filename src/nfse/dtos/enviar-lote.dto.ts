import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { EmitirRpsDto } from './emitir-rps.dto';

export class EnviarLoteDto {
  @IsString()
  prestadorCnpj!: string;

  @IsString()
  inscricaoMunicipal!: string;

  @IsString()
  numeroLote!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmitirRpsDto)
  rps!: EmitirRpsDto[];
}
