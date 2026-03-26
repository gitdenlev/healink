import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/apps/doctors/modules/doctors/doctor.entity';
import { AnalyticsDoctorsController } from './analytics-doctors.controller';
import { AnalyticsDoctorsService } from './analytics-doctors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor])],
  controllers: [AnalyticsDoctorsController],
  providers: [AnalyticsDoctorsService],
})
export class AnalyticsDoctorsModule {}
