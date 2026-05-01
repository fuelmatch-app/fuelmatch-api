import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role, TrainingIntensity } from '@prisma/client';
import { PeriodizationService } from './periodization.service';
import { PeriodizationRules } from './periodization.engine';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class LogTrainingDto {
  @IsEnum(TrainingIntensity)
  intensity: TrainingIntensity;

  @IsOptional() @IsString()
  notes?: string;
}

@ApiTags('periodization')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('periodization')
export class PeriodizationController {
  constructor(private readonly service: PeriodizationService) {}

  @Post('rules/:mealPlanId')
  @Roles(Role.NUTRITIONIST)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Salvar regras de periodização (nutri)' })
  saveRules(@Param('mealPlanId') mealPlanId: string, @Body() rules: PeriodizationRules) {
    return this.service.saveRules(mealPlanId, rules);
  }

  @Get('rules/:mealPlanId')
  @ApiOperation({ summary: 'Buscar regras de periodização' })
  getRules(@Param('mealPlanId') mealPlanId: string) {
    return this.service.getRules(mealPlanId);
  }

  @Get('today/:athleteId')
  @ApiOperation({ summary: 'Macros do dia (ajustadas pela periodização)' })
  getTodayMacros(@Param('athleteId') athleteId: string) {
    return this.service.getTodayMacros(athleteId);
  }

  @Post('log')
  @Roles(Role.ATHLETE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Registrar treino do dia' })
  logTraining(
    @CurrentUser() user: { athleteId?: string },
    @Body() dto: LogTrainingDto,
  ) {
    return this.service.logTraining(user.athleteId!, dto.intensity, dto.notes);
  }
}
