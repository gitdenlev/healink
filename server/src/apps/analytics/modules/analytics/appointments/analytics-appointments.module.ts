import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from 'src/apps/appointments/modules/appointment/appointment.entity';
import { AnalyticsAppointmentsController } from './analytics-appointments.controller';
import { AnalyticsAppointmentsService } from './analytics-appointments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment])],
  controllers: [AnalyticsAppointmentsController],
  providers: [AnalyticsAppointmentsService],
})
export class AnalyticsAppointmentsModule {}
