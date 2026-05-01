import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NutritionistModule } from './modules/nutritionist/nutritionist.module';
import { AthleteModule } from './modules/athlete/athlete.module';
import { MealPlanModule } from './modules/meal-plan/meal-plan.module';
import { FoodModule } from './modules/food/food.module';
import { PeriodizationModule } from './modules/periodization/periodization.module';
import { CheckInModule } from './modules/check-in/check-in.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Configuração global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting: 100 req/min por IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Cron jobs
    ScheduleModule.forRoot(),

    // Core
    PrismaModule,

    // Domínios
    AuthModule,
    UsersModule,
    NutritionistModule,
    AthleteModule,
    MealPlanModule,
    FoodModule,
    PeriodizationModule,
    CheckInModule,
    NotificationsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
