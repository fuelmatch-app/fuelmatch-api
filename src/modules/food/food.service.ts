import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FoodService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, limit = 20) {
    return this.prisma.food.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.food.findUnique({ where: { id } });
  }
}
