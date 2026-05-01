import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertSeverity, AlertType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Roda toda segunda-feira às 9h — verifica todos os atletas
   */
  @Cron('0 9 * * 1')
  async runWeeklyAlertCheck() {
    this.logger.log('Iniciando verificação semanal de alertas...');

    const athletes = await this.prisma.athlete.findMany({
      where: { nutritionistId: { not: null } },
      include: {
        checkIns: { orderBy: { createdAt: 'desc' }, take: 4 },
      },
    });

    for (const athlete of athletes) {
      await this.checkAthleteAlerts(athlete);
    }

    this.logger.log(`Alertas verificados para ${athletes.length} atletas`);
  }

  async checkAthleteAlerts(athlete: any) {
    const { id: athleteId, nutritionistId, checkIns } = athlete;
    if (!nutritionistId) return;

    const currentWeek = this.getWeekNumber(new Date());
    const currentYear = new Date().getFullYear();

    // ── Alerta: sem check-in esta semana ────────────────────────
    const hasCheckInThisWeek = checkIns.some(
      (c: any) => c.weekNumber === currentWeek && c.year === currentYear,
    );
    if (!hasCheckInThisWeek) {
      await this.createAlertIfNotExists(nutritionistId, athleteId, {
        type: AlertType.MISSED_CHECKIN,
        severity: AlertSeverity.INFO,
        message: 'Atleta não realizou o check-in desta semana',
      });
    }

    // ── Alerta: baixa adesão ─────────────────────────────────────
    const lastCheckin = checkIns[0];
    if (lastCheckin && lastCheckin.adherencePercent < 60) {
      await this.createAlertIfNotExists(nutritionistId, athleteId, {
        type: AlertType.LOW_ADHERENCE,
        severity: AlertSeverity.WARNING,
        message: `Adesão ao plano de ${lastCheckin.adherencePercent}% na última semana`,
      });
    }

    // ── Alerta: energia muito baixa ──────────────────────────────
    if (lastCheckin && lastCheckin.energyLevel <= 2) {
      await this.createAlertIfNotExists(nutritionistId, athleteId, {
        type: AlertType.LOW_ENERGY,
        severity: AlertSeverity.CRITICAL,
        message: `Atleta reportou energia muito baixa (${lastCheckin.energyLevel}/5) — possível subnutrição`,
      });
    }

    // ── Alerta: peso estagnado (3 semanas) ───────────────────────
    if (checkIns.length >= 3) {
      const weights = checkIns
        .slice(0, 3)
        .map((c: any) => c.weightKg)
        .filter(Boolean);

      if (weights.length === 3) {
        const maxDiff = Math.max(...weights) - Math.min(...weights);
        if (maxDiff < 0.3) {
          await this.createAlertIfNotExists(nutritionistId, athleteId, {
            type: AlertType.WEIGHT_STAGNATION,
            severity: AlertSeverity.WARNING,
            message: `Peso estagnado por 3 semanas consecutivas (variação: ${maxDiff.toFixed(1)}kg)`,
          });
        }
      }
    }
  }

  private async createAlertIfNotExists(
    nutritionistId: string,
    athleteId: string,
    data: { type: AlertType; severity: AlertSeverity; message: string },
  ) {
    // Evitar duplicar alertas ativos do mesmo tipo para o mesmo atleta
    const existing = await this.prisma.alert.findFirst({
      where: {
        nutritionistId,
        athleteId,
        type: data.type,
        isDismissed: false,
      },
    });

    if (existing) return;

    return this.prisma.alert.create({
      data: { nutritionistId, athleteId, ...data },
    });
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
