import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateNutritionistDto } from './dto/update-nutritionist.dto';

@Injectable()
export class NutritionistService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const nutritionist = await this.prisma.nutritionist.findUnique({
      where: { userId },
      include: {
        _count: { select: { athletes: true } },
      },
    });
    if (!nutritionist) throw new NotFoundException('Perfil de nutricionista não encontrado');
    return nutritionist;
  }

  async updateProfile(userId: string, dto: UpdateNutritionistDto) {
    await this.getProfile(userId); // valida existência
    return this.prisma.nutritionist.update({
      where: { userId },
      data: dto,
    });
  }

  async updatePhoto(userId: string, photoUrl: string) {
    return this.prisma.nutritionist.update({
      where: { userId },
      data: { photoUrl },
    });
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
