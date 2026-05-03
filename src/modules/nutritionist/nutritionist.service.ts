import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateNutritionistDto } from './dto/update-nutritionist.dto';

@Injectable()
export class NutritionistService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const nutritionist = await this.prisma.nutritionist.findUnique({
      where: { userId },
      include: { _count: { select: { athletes: true } } },
    });
    if (!nutritionist) throw new NotFoundException('Perfil de nutricionista não encontrado');
    return nutritionist;
  }

  async updateProfile(userId: string, dto: UpdateNutritionistDto) {
    await this.getProfile(userId);
    return this.prisma.nutritionist.update({ where: { userId }, data: dto });
  }

  async getAthletes(userId: string) {
    const nutritionist = await this.prisma.nutritionist.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!nutritionist) throw new NotFoundException('Nutricionista não encontrada');

    return this.prisma.athlete.findMany({
      where: { nutritionistId: nutritionist.id },
      select: {
        id: true,
        fullName: true,
        goal: true,
        weightKg: true,
        heightCm: true,
        bodyFatPercent: true,
        trainingDaysPerWeek: true,
        createdAt: true,
        checkIns: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true, adherencePercent: true, weightKg: true },
        },
        mealPlans: {
          where: { isActive: true },
          select: { id: true, name: true },
          take: 1,
        },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  /**
   * Vincula um atleta existente à nutricionista logada pelo email.
   * Chamado automaticamente após o cadastro de novo atleta no dashboard.
   */
  async linkAthleteByEmail(nutritionistUserId: string, athleteEmail: string) {
    const nutritionist = await this.prisma.nutritionist.findUnique({
      where: { userId: nutritionistUserId },
    });
    if (!nutritionist) throw new NotFoundException('Nutricionista não encontrada');

    const athleteUser = await this.prisma.user.findUnique({
      where: { email: athleteEmail },
      include: { athlete: true },
    });

    if (!athleteUser) {
      throw new NotFoundException(`Usuário com email ${athleteEmail} não encontrado`);
    }
    if (athleteUser.role !== 'ATHLETE') {
      throw new BadRequestException('Este usuário não é um atleta');
    }
    if (!athleteUser.athlete) {
      throw new NotFoundException('Perfil de atleta não encontrado para este usuário');
    }
    if (athleteUser.athlete.nutritionistId) {
      throw new BadRequestException('Este atleta já está vinculado a uma nutricionista');
    }

    return this.prisma.athlete.update({
      where: { id: athleteUser.athlete.id },
      data: { nutritionistId: nutritionist.id },
    });
  }

  async getAlerts(userId: string) {
    const nutritionist = await this.prisma.nutritionist.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!nutritionist) throw new NotFoundException('Nutricionista não encontrada');

    return this.prisma.alert.findMany({
      where: { nutritionistId: nutritionist.id, isDismissed: false },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async dismissAlert(userId: string, alertId: string, note?: string) {
    const nutritionist = await this.prisma.nutritionist.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!nutritionist) throw new NotFoundException('Nutricionista não encontrada');

    const alert = await this.prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) throw new NotFoundException('Alerta não encontrado');
    if (alert.nutritionistId !== nutritionist.id) throw new ForbiddenException();

    return this.prisma.alert.update({
      where: { id: alertId },
      data: { isDismissed: true, dismissedAt: new Date(), dismissNote: note },
    });
  }
}
