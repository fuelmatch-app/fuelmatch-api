import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CheckInService, CreateCheckInDto } from './check-in.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('check-in')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('check-in')
export class CheckInController {
  constructor(private readonly service: CheckInService) {}

  @Post()
  @Roles(Role.ATHLETE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Realizar check-in semanal' })
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateCheckInDto) {
    return this.service.create(user.id, dto);
  }

  @Get('my')
  @Roles(Role.ATHLETE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Histórico de check-ins do atleta logado' })
  myHistory(@CurrentUser() user: { id: string }) {
    return this.service.findMyHistory(user.id);
  }

  @Get('athlete/:id')
  @Roles(Role.NUTRITIONIST)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Histórico de check-ins de um atleta (nutri)' })
  byAthleteId(@Param('id') athleteId: string) {
    return this.service.findByAthleteId(athleteId);
  }

  @Get('athlete/:id/latest')
  @Roles(Role.NUTRITIONIST)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Check-in mais recente do atleta' })
  latest(@Param('id') athleteId: string) {
    return this.service.findLatest(athleteId);
  }
}
