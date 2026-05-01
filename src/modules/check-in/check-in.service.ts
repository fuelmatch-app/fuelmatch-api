import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertsService } from './alerts.service';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckInDto {
  @ApiProperty({ example: 82.5, required: false })
  @IsOptional() @IsNumber()
  weightKg?: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber() @Min(1) @Max(5)
  energyLevel: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber() @Min(1) @Max(5)
  sleepQuality: number;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsNumber() @Min(0) @Max(100)
  adherencePercent: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber() @Min(1) @Max(5)
  performanceLevel: number;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  notes?: string;
}

@Injectable()
export class CheckInService {
  constructor(
    private prisma: PrismaService,
    private alertsService: AlertsService,
  ) {}

  async create(athleteUserId: string, dto: CreateCheckInDto) {
    const athlete = await this.prisma.athlete.findUnique({
      where: { userId: athleteUserId },
    });
    if (!athlete) throw new NotFoundException('Perfil de atleta não encontrado');

    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();

    // Verificar se já existe check-in na semana
    const existing = await this.prisma.checkIn.findUnique({
      where: { athleteId_weekNumber_year: { athleteId: athlete.id, weekNumber, year } },
    });
    if (existing) {
      throw new ConflictException('Check-in desta semana já realizado');
    }

    const checkIn = await this.prisma.checkIn.create({
      data: { athleteId: athlete.id, weekNumber, year, ...dto },
    });

    // Verificar alertas após novo check-in
    const athleteWithCheckIns = await this.prisma.athlete.findUnique({
      where: { id: athlete.id },
      include: { checkIns: { orderBy: { createdAt: 'desc' }, take: 4 } },
    });
    await this.alertsService.checkAthleteAlerts(athleteWithCheckIns);

    return checkIn;
  }

  async findMyHistory(athleteUserId: string) {
    const athlete = await this.prisma.athlete.findUnique({ where: { userId: athleteUserId } });
    if (!athlete) throw new NotFoundException('Atleta não encontrado');

    return this.prisma.checkIn.findMany({
      where: { athleteId: athlete.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByAthleteId(athleteId: string) {
    return this.prisma.checkIn.findMany({
      where: { athleteId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findLatest(athleteId: string) {
    return this.prisma.checkIn.findFirst({
      where: { athleteId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
