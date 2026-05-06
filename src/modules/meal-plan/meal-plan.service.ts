import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MacrosCalculator } from './macros.calculator';
import { CreateMealPlanDto, AddMealDto, AddFoodToMealDto } from './dto/create-meal-plan.dto';

@Injectable()
export class MealPlanService {
  constructor(private prisma: PrismaService) {}

  async create(nutritionistUserId: string, dto: CreateMealPlanDto) {
    const nutritionist = await this.prisma.nutritionist.findUnique({
      where: { userId: nutritionistUserId },
    });
    if (!nutritionist) throw new NotFoundException('Nutricionista não encontrada');

    const athlete = await this.prisma.athlete.findUnique({
      where: { id: dto.athleteId },
      include: { user: true },
    });
    if (!athlete) throw new NotFoundException('Atleta não encontrado');

    // Calcular macros via TDEE se não informados
    let { baseCalories, baseProteinG, baseCarbsG, baseFatG } = dto;

    if (!baseCalories) {
      const macros = MacrosCalculator.calculate(
        athlete.weightKg,
        athlete.heightCm,
        athlete.birthDate,
        athlete.gender,
        athlete.trainingDaysPerWeek,
        athlete.goal,
      );
      baseCalories = macros.calories;
      baseProteinG  = baseProteinG  ?? macros.proteinG;
      baseCarbsG    = baseCarbsG    ?? macros.carbsG;
      baseFatG      = baseFatG      ?? macros.fatG;
    }

    return this.prisma.mealPlan.create({
      data: {
        name: dto.name,
        athleteId: dto.athleteId,
        nutritionistId: nutritionist.id,
        baseCalories: baseCalories!,
        baseProteinG: baseProteinG!,
        baseCarbsG: baseCarbsG!,
        baseFatG: baseFatG!,
        periodizationRules: dto.periodizationRules ?? undefined,
        notes: dto.notes,
      },
    });
  }

  async findById(id: string) {
    const plan = await this.prisma.mealPlan.findUnique({
      where: { id },
      include: {
        meals: {
          orderBy: { order: 'asc' },
          include: {
            foods: { include: { food: true } },
          },
        },
      },
    });
    if (!plan) throw new NotFoundException('Plano não encontrado');
    return plan;
  }

  async activate(planId: string, nutritionistUserId: string) {
    const nutritionist = await this.prisma.nutritionist.findUnique({
      where: { userId: nutritionistUserId },
    });
    if (!nutritionist) throw new NotFoundException('Nutricionista não encontrada');

    const plan = await this.prisma.mealPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plano não encontrado');
    if (plan.nutritionistId !== nutritionist.id) throw new BadRequestException('Acesso negado');

    // Desativar planos ativos do atleta e ativar o novo
    await this.prisma.$transaction([
      this.prisma.mealPlan.updateMany({
        where: { athleteId: plan.athleteId, isActive: true },
        data: { isActive: false },
      }),
      this.prisma.mealPlan.update({
        where: { id: planId },
        data: { isActive: true },
      }),
    ]);

    return this.findById(planId);
  }

  async getActivePlan(athleteId: string) {
    const plan = await this.prisma.mealPlan.findFirst({
      where: { athleteId, isActive: true },
      include: {
        meals: {
          orderBy: { order: 'asc' },
          include: { foods: { include: { food: true } } },
        },
      },
    });
    if (!plan) throw new NotFoundException('Nenhum plano ativo encontrado');
    return plan;
  }

  async addMeal(planId: string, dto: AddMealDto) {
    const plan = await this.prisma.mealPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plano não encontrado');

    return this.prisma.meal.create({
      data: {
        mealPlanId: planId,
        name: dto.name,
        timeOfDay: dto.timeOfDay,
        mealType: dto.mealType,
        order: dto.order ?? 0,
      },
    });
  }

  async addFoodToMeal(mealId: string, dto: AddFoodToMealDto) {
    const meal = await this.prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) throw new NotFoundException('Refeição não encontrada');

    const food = await this.prisma.food.findUnique({ where: { id: dto.foodId } });
    if (!food) throw new NotFoundException('Alimento não encontrado');

    return this.prisma.mealFood.create({
      data: { mealId, foodId: dto.foodId, quantityG: dto.quantityG },
      include: { food: true },
    });
  }
}
