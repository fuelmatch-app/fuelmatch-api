import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'nutri@fuelmatch.app' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'Senha@123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  password: string;

  @ApiProperty({ enum: Role, example: Role.NUTRITIONIST })
  @IsEnum(Role, { message: 'Role deve ser NUTRITIONIST ou ATHLETE' })
  role: Role;

  @ApiProperty({ example: 'Mariana Silva' })
  @IsString()
  fullName: string;

  /**
   * Obrigatório apenas para NUTRITIONIST
   * ex: "CRN-2/12345"
   */
  @ApiProperty({ example: 'CRN-2/12345', required: false })
  @IsOptional()
  @IsString()
  crnNumber?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'nutri@fuelmatch.app' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'Senha@123' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
