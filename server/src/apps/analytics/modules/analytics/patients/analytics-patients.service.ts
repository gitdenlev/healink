import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from 'src/apps/patients/modules/patients/entities/patient.entity';

@Injectable()
export class AnalyticsPatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async getGenderRatio() {
    const total = await this.patientRepo.count();
    if (total === 0) return { male: 0, female: 0 };

    const maleCount = await this.patientRepo.count({
      where: { gender: 'Male' },
    });
    const femaleCount = await this.patientRepo.count({
      where: { gender: 'Female' },
    });

    return {
      male: Number(((maleCount / total) * 100).toFixed(1)),
      female: Number(((femaleCount / total) * 100).toFixed(1)),
      total,
    };
  }

  async topCities() {
    return await this.patientRepo
      .createQueryBuilder('patients')
      .select('patients.city', 'city')
      .addSelect('COUNT(patients.id)', 'count')
      .groupBy('patients.city')
      .orderBy('count', 'DESC')
      .getRawMany();
  }

  async allergies() {
    return await this.patientRepo
      .createQueryBuilder('patients')
      .select('patients.allergy', 'name')
      .addSelect('COUNT(patients.id)', 'value')
      .groupBy('patients.allergy')
      .orderBy('value', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async diseases() {
    return await this.patientRepo
      .createQueryBuilder('patients')
      .select('patients.disease', 'name')
      .addSelect('COUNT(patients.id)', 'value')
      .groupBy('patients.disease')
      .orderBy('value', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async ageGroups() {
    const query = `
            SELECT 
                CASE 
                    WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 18 THEN 'Under 18'
                    WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 18 AND 25 THEN '18-25'
                    WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 26 AND 35 THEN '26-35'
                    WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 36 AND 45 THEN '36-45'
                    WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 46 AND 60 THEN '46-60'
                    ELSE '60+'
                END as name,
                COUNT(id) as value
            FROM patients
            GROUP BY name
            ORDER BY name ASC
        `;
    return await this.patientRepo.query(query);
  }
}
