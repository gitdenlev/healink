import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from 'src/apps/patients/modules/patients/entities/patient.entity';
import { AnalyticsPatientsService } from './analytics-patients.service';
import { AnalyticsPatientsController } from './analytics-patients.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Patient])],
  providers: [AnalyticsPatientsService],
  controllers: [AnalyticsPatientsController],
  exports: [AnalyticsPatientsService],
})
export class AnalyticsPatientsModule {}
