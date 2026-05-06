import { IsString, IsOptional, IsArray, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNutritionistDto {
  @ApiProperty({ example: 'Mariana Silva', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: 'Especialista em nutrição esportiva...', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: ['musculação', 'cutting', 'hipertrofia'], required: false })
  @IsOptional()
  @IsArray()
  specialties?: string[];

  @ApiProperty({ example: 'https://instagram.com/nutri.mariana', required: false })
  @IsOptional()
  @IsUrl({}, { message: 'URL do Instagram inválida' })
  instagramUrl?: string;
}
