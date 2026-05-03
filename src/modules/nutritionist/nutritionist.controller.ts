import { Controller, Get, Put, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { Role } from '@prisma/client';
import { NutritionistService } from './nutritionist.service';
import { UpdateNutritionistDto } from './dto/update-nutritionist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class LinkAthleteDto {
  @ApiProperty({ example: 'atleta@email.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;
}

@ApiTags('nutritionist')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.NUTRITIONIST)
@Controller('nutritionist')
export class NutritionistController {
  constructor(private readonly service: NutritionistService) {}

  @Get('me')
  @ApiOperation({ summary: 'Perfil próprio da nutricionista' })
  getProfile(@CurrentUser() user: { id: string }) {
    return this.service.getProfile(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Atualizar perfil' })
  updateProfile(@CurrentUser() user: { id: string }, @Body() dto: UpdateNutritionistDto) {
    return this.service.updateProfile(user.id, dto);
  }

  @Get('athletes')
  @ApiOperation({ summary: 'Listar atletas vinculados' })
  getAthletes(@CurrentUser() user: { id: string }) {
    return this.service.getAthletes(user.id);
  }

  @Post('athletes/link')
  @ApiOperation({ summary: 'Vincular atleta existente pelo email' })
  linkAthlete(@CurrentUser() user: { id: string }, @Body() dto: LinkAthleteDto) {
    return this.service.linkAthleteByEmail(user.id, dto.email);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Alertas ativos' })
  getAlerts(@CurrentUser() user: { id: string }) {
    return this.service.getAlerts(user.id);
  }

  @Put('alerts/:id/dismiss')
  @ApiOperation({ summary: 'Dispensar alerta' })
  dismissAlert(
    @CurrentUser() user: { id: string },
    @Param('id') alertId: string,
    @Body('note') note?: string,
  ) {
    return this.service.dismissAlert(user.id, alertId, note);
  }
}
