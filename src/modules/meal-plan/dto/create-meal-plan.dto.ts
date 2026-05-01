import { IsString, IsNumber, IsOptional, IsUUID, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MealType } from '@prisma/client';

export class CreateMealPlanDto {
  @ApiProperty({ example: 'Plano Hipertrofia — Julho 2025' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'uuid-do-atleta' })
  @IsUUID()
  athleteId: string;

  @ApiProperty({ example: 2500, required: false, description: 'Se omitido, calcula automaticamente via TDEE' })
  @IsOptional()
  @IsNumber()
  @Min(800)
  baseCalories?: number;

  @ApiProperty({ example: 190, required: false })
  @IsOptional() @IsNumber() @Min(0)
  baseProteinG?: number;

  @ApiProperty({ example: 280, required: false })
  @IsOptional() @IsNumber() @Min(0)
  baseCarbsG?: number;

  @ApiProperty({ example: 75, required: false })
  @IsOptional() @IsNumber() @Min(0)
  baseFatG?: number;

  @ApiProperty({ required: false, description: 'Regras de periodização em JSON' })
  @IsOptional()
  periodizationRules?: object;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  notes?: string;
}

export class AddMealDto {
  @ApiProperty({ example: 'Café da manhã' })
  @IsString()
  name: string;

  @ApiProperty({ example: '07:00' })
  @IsString()
  timeOfDay: string;

  @ApiProperty({ enum: MealType, default: MealType.REGULAR })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;

  @ApiProperty({ example: 0 })
  @IsOptional() @IsNumber()
  order?: number;
}

export class AddFoodToMealDto {
  @ApiProperty({ example: 'uuid-do-alimento' })
  @IsUUID()
  foodId: string;

  @ApiProperty({ example: 150, description: 'Quantidade em gramas' })
  @IsNumber()
  @Min(1)
  quantityG: number;
}
