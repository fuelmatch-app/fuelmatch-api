import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAthleteDto, AnamnesisDto } from './dto/anamnesis.dto';

@Injectable()
export class AthleteService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateAthleteDto) {
    return this.prisma.athlete.create({
      data: {
        userId,
        fullName: dto.fullName,
        birthDate: new Date(dto.birthDate),
        gender: dto.gender,
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        goal: dto.goal,
        trainingDaysPerWeek: dto.trainingDaysPerWeek,
      },
    });
  }

  async getProfile(userId: string) {
    const athlete = await this.prisma.athlete.findUnique({
      where: { userId },
      include: {
        nutritionist: { select: { fullName: true, photoUrl: true } },
        mealPlans: { where: { isActive: true }, take: 1 },
        checkIns: { orderBy: { createdAt: 'desc' }, take: 4 },
      },
    });
    if (!athlete) throw new NotFoundException('Perfil de atleta não encontrado');
    return athlete;
  }

  async getProfileById(athleteId: string) {
    const athlete = await this.prisma.athlete.findUnique({ where: { id: athleteId } });
    if (!athlete) throw new NotFoundException('Atleta não encontrado');
    return athlete;
  }

  async saveAnamnesis(userId: string, dto: AnamnesisDto) {
    const athlete = await this.prisma.athlete.findUnique({ where: { userId } });
    if (!athlete) throw new NotFoundException('Perfil de atleta não encontrado');

    return this.prisma.athlete.update({
      where: { userId },
      data: {
        anamnesis: dto as any,
        weightKg: dto.currentWeight,
        bodyFatPercent: dto.bodyFatPercent,
        trainingDaysPerWeek: dto.trainingFrequency,
      },
    });
  }

  async getAnamnesis(userId: string) {
    const athlete = await this.prisma.athlete.findUnique({
      where: { userId },
      select: { anamnesis: true, updatedAt: true },
    });
    if (!athlete) throw new NotFoundException('Atleta não encontrado');
    return athlete;
  }

  async getAnamnesisById(athleteId: string) {
    const athlete = await this.prisma.athlete.findUnique({
      where: { id: athleteId },
      select: { anamnesis: true, updatedAt: true, fullName: true },
    });
    if (!athlete) throw new NotFoundException('Atleta não encontrado');
    return athlete;
  }
}
