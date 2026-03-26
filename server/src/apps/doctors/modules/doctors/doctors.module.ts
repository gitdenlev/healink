import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { Patient } from 'src/apps/patients/modules/patients/entities/patient.entity';
import { Appointment } from 'src/apps/appointments/modules/appointment/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, Patient, Appointment])],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
