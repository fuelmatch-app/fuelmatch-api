import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AthleteService } from './athlete.service';
import { CreateAthleteDto, AnamnesisDto } from './dto/anamnesis.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('athlete')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('athlete')
export class AthleteController {
  constructor(private readonly service: AthleteService) {}

  @Post('profile')
  @Roles(Role.ATHLETE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Criar perfil do atleta' })
  createProfile(@CurrentUser() user: { id: string }, @Body() dto: CreateAthleteDto) {
    return this.service.createProfile(user.id, dto);
  }

  @Get('me')
  @Roles(Role.ATHLETE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Perfil próprio do atleta' })
  getProfile(@CurrentUser() user: { id: string }) {
    return this.service.getProfile(user.id);
  }

  @Post('anamnesis')
  @Roles(Role.ATHLETE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Salvar anamnese' })
  saveAnamnesis(@CurrentUser() user: { id: string }, @Body() dto: AnamnesisDto) {
    return this.service.saveAnamnesis(user.id, dto);
  }

  @Get('anamnesis')
  @Roles(Role.ATHLETE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Buscar anamnese própria' })
  getAnamnesis(@CurrentUser() user: { id: string }) {
    return this.service.getAnamnesis(user.id);
  }

  @Get(':id/anamnesis')
  @Roles(Role.NUTRITIONIST)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Buscar anamnese do atleta (nutricionista)' })
  getAnamnesisById(@Param('id') athleteId: string) {
    return this.service.getAnamnesisById(athleteId);
  }
}
