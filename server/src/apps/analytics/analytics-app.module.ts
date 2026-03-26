import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Admin } from 'src/modules/admins/entities/admin.entity';
import { Doctor } from 'src/apps/doctors/modules/doctors/doctor.entity';
import { Patient } from 'src/apps/patients/modules/patients/entities/patient.entity';
import { Appointment } from 'src/apps/appointments/modules/appointment/appointment.entity';

import { AnalyticsPatientsModule } from 'src/apps/analytics/modules/analytics/patients/analytics-patients.module';
import { AnalyticsDoctorsModule } from 'src/apps/analytics/modules/analytics/doctors/analytics-doctors.module';
import { AnalyticsAppointmentsModule } from 'src/apps/analytics/modules/analytics/appointments/analytics-appointments.module';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASS ?? 'postgres',
      database: process.env.DB_NAME ?? 'healink',
      entities: [Admin, Doctor, Patient, Appointment],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: false,
    }),
    AnalyticsPatientsModule,
    AnalyticsDoctorsModule,
    AnalyticsAppointmentsModule,
    AuthModule,
  ],
})
export class AnalyticsAppModule {}
