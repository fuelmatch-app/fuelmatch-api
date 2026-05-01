import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FoodService } from './food.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('food')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('food')
export class FoodController {
  constructor(private readonly service: FoodService) {}

  @Get('search')
  @ApiOperation({ summary: 'Busca de alimentos na tabela TACO' })
  @ApiQuery({ name: 'q', example: 'frango' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  search(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.service.search(query, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um alimento' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
