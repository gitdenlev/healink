import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from 'src/apps/doctors/modules/doctors/doctor.entity';

@Injectable()
export class AnalyticsDoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  async getGenderRatio() {
    const total = await this.doctorRepo.count();
    if (total === 0) return { male: 0, female: 0 };

    const maleCount = await this.doctorRepo.count({
      where: { gender: 'Male' },
    });
    const femaleCount = await this.doctorRepo.count({
      where: { gender: 'Female' },
    });

    return {
      male: Number(((maleCount / total) * 100).toFixed(1)),
      female: Number(((femaleCount / total) * 100).toFixed(1)),
      total,
    };
  }

  async getExperienceDistribution() {
    const query = `
      SELECT 
        CASE 
          WHEN experience_years < 5 THEN '0-5 years'
          WHEN experience_years BETWEEN 5 AND 15 THEN '5-15 years'
          ELSE '15+ years'
        END as name,
        COUNT(id) as value
      FROM doctors
      GROUP BY name
      ORDER BY name ASC
    `;
    return await this.doctorRepo.query(query);
  }

  async getDepartmentDistribution() {
    return await this.doctorRepo
      .createQueryBuilder('doctors')
      .select('doctors.department', 'name')
      .addSelect('COUNT(doctors.id)', 'value')
      .groupBy('doctors.department')
      .orderBy('value', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getTopDoctorsByPatientLoad() {
    return await this.doctorRepo
      .createQueryBuilder('doctors')
      .leftJoin('doctors.appointments', 'appointments')
      .select("CONCAT(doctors.first_name, ' ', doctors.last_name)", 'name')
      .addSelect('COUNT(appointments.id)', 'value')
      .groupBy('doctors.id')
      .orderBy('value', 'DESC')
      .limit(7)
      .getRawMany();
  }
}
