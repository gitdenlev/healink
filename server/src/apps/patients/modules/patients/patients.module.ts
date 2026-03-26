import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from './entities/patient.entity';
import { Doctor } from 'src/apps/doctors/modules/doctors/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Doctor])],
  providers: [PatientsService],
  controllers: [PatientsController],
})
export class PatientsModule {}
