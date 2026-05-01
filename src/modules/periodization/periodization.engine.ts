import { TrainingIntensity } from '@prisma/client';

export interface MacroMultipliers {
  caloriesMultiplier: number;
  proteinMultiplier: number;
  carbsMultiplier: number;
  fatMultiplier: number;
}

export interface PeriodizationRules {
  trainingDay: {
    heavy:    MacroMultipliers;
    moderate: MacroMultipliers;
    light:    MacroMultipliers;
  };
  restDay: MacroMultipliers;
}

export interface DailyMacros {
  calories: number;
  proteinG: number;
  carbsG:   number;
  fatG:     number;
  isTrainingDay: boolean;
  intensity: TrainingIntensity;
}

export const DEFAULT_PERIODIZATION_RULES: PeriodizationRules = {
  trainingDay: {
    heavy:    { caloriesMultiplier: 1.15, proteinMultiplier: 1.10, carbsMultiplier: 1.30, fatMultiplier: 0.95 },
    moderate: { caloriesMultiplier: 1.08, proteinMultiplier: 1.05, carbsMultiplier: 1.15, fatMultiplier: 1.00 },
    light:    { caloriesMultiplier: 1.02, proteinMultiplier: 1.02, carbsMultiplier: 1.05, fatMultiplier: 1.00 },
  },
  restDay:    { caloriesMultiplier: 0.88, proteinMultiplier: 1.00, carbsMultiplier: 0.75, fatMultiplier: 1.10 },
};

export class PeriodizationEngine {
  /**
   * Calcula as macros do dia aplicando os multiplicadores ao plano base
   */
  static calculate(
    basePlan: { baseCalories: number; baseProteinG: number; baseCarbsG: number; baseFatG: number },
    intensity: TrainingIntensity,
    rules?: PeriodizationRules | null,
  ): DailyMacros {
    const r = rules ?? DEFAULT_PERIODIZATION_RULES;
    const isTrainingDay = intensity !== TrainingIntensity.REST;

    let multipliers: MacroMultipliers;

    if (!isTrainingDay) {
      multipliers = r.restDay;
    } else {
      const key = intensity.toLowerCase() as 'heavy' | 'moderate' | 'light';
      multipliers = r.trainingDay[key] ?? r.trainingDay.moderate;
    }

    return {
      calories: Math.round(basePlan.baseCalories * multipliers.caloriesMultiplier),
      proteinG: Math.round(basePlan.baseProteinG * multipliers.proteinMultiplier),
      carbsG:   Math.round(basePlan.baseCarbsG   * multipliers.carbsMultiplier),
      fatG:     Math.round(basePlan.baseFatG      * multipliers.fatMultiplier),
      isTrainingDay,
      intensity,
    };
  }

  /**
   * Valida se as regras de periodização fazem sentido fisiológico
   */
  static validate(rules: PeriodizationRules): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if (rules.restDay.carbsMultiplier > 1.0) {
      warnings.push('Carboidratos no dia de descanso acima do plano base — verifique se é intencional');
    }
    if (rules.trainingDay.heavy.caloriesMultiplier < 1.0) {
      warnings.push('Calorias no treino pesado abaixo do plano base — pode comprometer performance');
    }
    if (rules.trainingDay.heavy.carbsMultiplier < rules.trainingDay.moderate.carbsMultiplier) {
      warnings.push('Carbs do treino pesado menor que treino moderado — verifique os multiplicadores');
    }

    return { valid: true, warnings };
  }
}
