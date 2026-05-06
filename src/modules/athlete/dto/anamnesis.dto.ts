import {
  IsString, IsNumber, IsEnum, IsOptional, IsArray,
  IsBoolean, Min, Max, IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, Goal, TrainingExperience } from '@prisma/client';

export class CreateAthleteDto {
  @ApiProperty({ example: 'Rafael Costa' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '1996-03-15' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 178 })
  @IsNumber()
  heightCm: number;

  @ApiProperty({ example: 82 })
  @IsNumber()
  weightKg: number;

  @ApiProperty({ enum: Goal })
  @IsEnum(Goal)
  goal: Goal;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1) @Max(7)
  trainingDaysPerWeek: number;
}

export class AnamnesisDto {
  // Composição corporal
  @ApiProperty({ example: 82 })
  @IsNumber()
  currentWeight: number;

  @ApiProperty({ example: 78, required: false })
  @IsOptional() @IsNumber()
  goalWeight?: number;

  @ApiProperty({ example: 18.5, required: false })
  @IsOptional() @IsNumber()
  bodyFatPercent?: number;

  // Treino
  @ApiProperty({ enum: TrainingExperience })
  @IsEnum(TrainingExperience)
  trainingExperience: TrainingExperience;

  @ApiProperty({ example: 5 })
  @IsNumber() @Min(1) @Max(7)
  trainingFrequency: number;

  @ApiProperty({ example: 60 })
  @IsNumber()
  trainingDurationMin: number;

  @ApiProperty({ example: 'morning', enum: ['morning','afternoon','evening','varied'] })
  @IsString()
  trainingTime: string;

  @ApiProperty({ example: ['squat', 'bench', 'deadlift'] })
  @IsArray() @IsString({ each: true })
  mainExercises: string[];

  // Saúde
  @ApiProperty({ example: [] })
  @IsArray() @IsString({ each: true })
  medicalConditions: string[];

  @ApiProperty({ example: [] })
  @IsArray() @IsString({ each: true })
  allergies: string[];

  @ApiProperty({ example: ['lactose'] })
  @IsArray() @IsString({ each: true })
  intolerances: string[];

  @ApiProperty({ example: [] })
  @IsArray() @IsString({ each: true })
  currentMedications: string[];

  @ApiProperty({ example: ['creatina', 'whey'] })
  @IsArray() @IsString({ each: true })
  supplements: string[];

  // Estilo de vida
  @ApiProperty({ example: 7.5 })
  @IsNumber() @Min(0) @Max(24)
  sleepHours: number;

  @ApiProperty({ example: 3, minimum: 1, maximum: 5 })
  @IsNumber() @Min(1) @Max(5)
  stressLevel: number;

  @ApiProperty({ example: 'sedentary', enum: ['sedentary','light','moderate','heavy'] })
  @IsString()
  workType: string;

  @ApiProperty({ example: 5 })
  @IsNumber() @Min(1) @Max(10)
  mealFrequency: number;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  waterIntakeLiters: number;

  // Exames (opcional)
  @ApiProperty({ required: false })
  @IsOptional()
  labResults?: {
    hemoglobin?: number;
    ferritin?: number;
    vitaminD?: number;
    testosterone?: number;
    tsh?: number;
  };
}
