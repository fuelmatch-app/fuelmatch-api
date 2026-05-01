import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { NutritionistService } from './nutritionist.service';
import { UpdateNutritionistDto } from './dto/update-nutritionist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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
