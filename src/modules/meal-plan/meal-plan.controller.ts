import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { MealPlanService } from './meal-plan.service';
import { CreateMealPlanDto, AddMealDto, AddFoodToMealDto } from './dto/create-meal-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('meal-plan')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('meal-plan')
export class MealPlanController {
  constructor(private readonly service: MealPlanService) {}

  @Post()
  @Roles(Role.NUTRITIONIST)
  @ApiOperation({ summary: 'Criar plano alimentar' })
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateMealPlanDto) {
    return this.service.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar plano por ID' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put(':id/activate')
  @Roles(Role.NUTRITIONIST)
  @ApiOperation({ summary: 'Ativar plano (desativa os demais do atleta)' })
  activate(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.service.activate(id, user.id);
  }

  @Get('athlete/:athleteId/active')
  @ApiOperation({ summary: 'Plano ativo do atleta' })
  getActivePlan(@Param('athleteId') athleteId: string) {
    return this.service.getActivePlan(athleteId);
  }

  @Post(':id/meal')
  @Roles(Role.NUTRITIONIST)
  @ApiOperation({ summary: 'Adicionar refeição ao plano' })
  addMeal(@Param('id') planId: string, @Body() dto: AddMealDto) {
    return this.service.addMeal(planId, dto);
  }

  @Post('meal/:mealId/food')
  @Roles(Role.NUTRITIONIST)
  @ApiOperation({ summary: 'Adicionar alimento à refeição' })
  addFood(@Param('mealId') mealId: string, @Body() dto: AddFoodToMealDto) {
    return this.service.addFoodToMeal(mealId, dto);
  }
}
