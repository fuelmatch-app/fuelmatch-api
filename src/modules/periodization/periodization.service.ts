import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingIntensity } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PeriodizationEngine, PeriodizationRules } from './periodization.engine';

@Injectable()
export class PeriodizationService {
  constructor(private prisma: PrismaService) {}

  async saveRules(mealPlanId: string, rules: PeriodizationRules) {
    const plan = await this.prisma.mealPlan.findUnique({ where: { id: mealPlanId } });
    if (!plan) throw new NotFoundException('Plano não encontrado');

    const validation = PeriodizationEngine.validate(rules);

    await this.prisma.mealPlan.update({
      where: { id: mealPlanId },
      data: { periodizationRules: rules as any },
    });

    return { saved: true, warnings: validation.warnings };
  }

  async getRules(mealPlanId: string) {
    const plan = await this.prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      select: { periodizationRules: true },
    });
    if (!plan) throw new NotFoundException('Plano não encontrado');
    return plan.periodizationRules;
  }

  async getTodayMacros(athleteId: string) {
    const plan = await this.prisma.mealPlan.findFirst({
      where: { athleteId, isActive: true },
    });
    if (!plan) throw new NotFoundException('Nenhum plano ativo encontrado');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLog = await this.prisma.trainingLog.findFirst({
      where: {
        athleteId,
        date: { gte: today, lt: tomorrow },
      },
      orderBy: { createdAt: 'desc' },
    });

    const intensity = todayLog?.intensity ?? TrainingIntensity.REST;
    const rules = plan.periodizationRules as PeriodizationRules | null;

    return PeriodizationEngine.calculate(plan, intensity, rules);
  }

  async logTraining(athleteId: string, intensity: TrainingIntensity, notes?: string) {
    return this.prisma.trainingLog.create({
      data: { athleteId, intensity, notes },
    });
  }
}
