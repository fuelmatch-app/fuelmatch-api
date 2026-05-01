import { Module } from '@nestjs/common';
import { PeriodizationController } from './periodization.controller';
import { PeriodizationService } from './periodization.service';

@Module({
  controllers: [PeriodizationController],
  providers: [PeriodizationService],
  exports: [PeriodizationService],
})
export class PeriodizationModule {}
