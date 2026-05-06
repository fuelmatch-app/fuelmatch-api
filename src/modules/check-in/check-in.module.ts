import { Module } from '@nestjs/common';
import { CheckInController } from './check-in.controller';
import { CheckInService } from './check-in.service';
import { AlertsService } from './alerts.service';

@Module({
  controllers: [CheckInController],
  providers: [CheckInService, AlertsService],
  exports: [CheckInService, AlertsService],
})
export class CheckInModule {}
