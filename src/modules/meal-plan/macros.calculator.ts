import { Goal, Gender } from '@prisma/client';

export interface MacrosResult {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export class MacrosCalculator {
  /**
   * Calcula TMB usando Mifflin-St Jeor
   */
  static calculateTMB(weightKg: number, heightCm: number, ageYears: number, gender: Gender): number {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
    return gender === Gender.MALE ? base + 5 : base - 161;
  }

  /**
   * Calcula TDEE (Total Daily Energy Expenditure)
   */
  static calculateTDEE(tmb: number, trainingDaysPerWeek: number): number {
    const factors: Record<number, number> = {
      0: 1.2,
      1: 1.375,
      2: 1.375,
      3: 1.55,
      4: 1.55,
      5: 1.725,
      6: 1.725,
      7: 1.9,
    };
    const factor = factors[Math.min(trainingDaysPerWeek, 7)] ?? 1.55;
    return Math.round(tmb * factor);
  }

  /**
   * Ajusta calorias pelo objetivo
   */
  static adjustByGoal(tdee: number, goal: Goal): number {
    const adjustments: Record<Goal, number> = {
      [Goal.HYPERTROPHY]:        tdee + 300,
      [Goal.CUTTING]:            tdee - 400,
      [Goal.BODY_RECOMPOSITION]: tdee,
      [Goal.MAINTENANCE]:        tdee,
    };
    return Math.round(adjustments[goal]);
  }

  /**
   * Distribui macronutrientes conforme objetivo (musculação)
   *
   * Proteína: 1.8–2.2g/kg — base para preservação/ganho muscular
   * Gordura:  25–30% das calorias
   * Carbo:    restante
   */
  static distributeMacros(calories: number, weightKg: number, goal: Goal): MacrosResult {
    const proteinPerKg: Record<Goal, number> = {
      [Goal.HYPERTROPHY]:        2.0,
      [Goal.CUTTING]:            2.2,  // mais proteína no cutting para preservar massa
      [Goal.BODY_RECOMPOSITION]: 2.0,
      [Goal.MAINTENANCE]:        1.8,
    };

    const fatPercent: Record<Goal, number> = {
      [Goal.HYPERTROPHY]:        0.27,
      [Goal.CUTTING]:            0.25,
      [Goal.BODY_RECOMPOSITION]: 0.28,
      [Goal.MAINTENANCE]:        0.30,
    };

    const proteinG = Math.round(weightKg * proteinPerKg[goal]);
    const fatG = Math.round((calories * fatPercent[goal]) / 9);
    const proteinCalories = proteinG * 4;
    const fatCalories = fatG * 9;
    const carbsG = Math.round((calories - proteinCalories - fatCalories) / 4);

    return { calories, proteinG, carbsG, fatG };
  }

  /**
   * Calcula macros completas a partir dos dados do atleta
   */
  static calculate(
    weightKg: number,
    heightCm: number,
    birthDate: Date,
    gender: Gender,
    trainingDaysPerWeek: number,
    goal: Goal,
  ): MacrosResult {
    const ageYears = Math.floor(
      (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );
    const tmb = this.calculateTMB(weightKg, heightCm, ageYears, gender);
    const tdee = this.calculateTDEE(tmb, trainingDaysPerWeek);
    const calories = this.adjustByGoal(tdee, goal);
    return this.distributeMacros(calories, weightKg, goal);
  }
}
