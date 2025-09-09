import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TimeTaskService } from './timetask.service';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Import the NestJS Schedule module
  ],
  providers: [TimeTaskService],
  exports: [TimeTaskService],
})
export class TimeTaskModule {}
