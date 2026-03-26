import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient, PatientStatus } from './entities/patient.entity';
import { Doctor } from 'src/apps/doctors/modules/doctors/doctor.entity';
import { AuthActor } from 'src/modules/auth/auth-actor.interface';
import { UserRole } from 'src/modules/admins/entities/admin.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  async countAll(): Promise<number> {
    return this.patientRepo.count();
  }

  async getStats() {
    return await this.patientRepo
      .createQueryBuilder('patients')
      .select('patients.status', 'status')
      .addSelect('COUNT(patients.id)', 'count')
      .groupBy('patients.status')
      .getRawMany();
  }

  async averageAge() {
    return await this.patientRepo
      .createQueryBuilder('patients')
      .select(
        'AVG(EXTRACT(YEAR FROM AGE(patients.date_of_birth)))',
        'averageAge',
      )
      .getRawOne();
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    actor?: AuthActor,
  ) {
    const query = this.patientRepo
      .createQueryBuilder('patient')
      .leftJoin('patient.assignedDoctor', 'assignedDoctor')
      .select([
        'patient.id',
        'patient.firstName',
        'patient.lastName',
        'patient.avatarUrl',
        'patient.city',
        'patient.status',
        'patient.gender',
        'patient.dateOfBirth',
        'patient.allergy',
        'patient.disease',
        'patient.contactNumber',
        'patient.email',
        'patient.createdAt',
        'assignedDoctor.id',
      ]);

    if (actor?.role === UserRole.DOCTOR) {
      query.andWhere('patient.assigned_doctor_id = :doctorId', {
        doctorId: actor.userId,
      });
    }

    if (search) {
      const s = `%${search.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(patient.firstName) LIKE :s OR LOWER(patient.lastName) LIKE :s OR LOWER(patient.city) LIKE :s)',
        { s },
      );
    }

    if (status) {
      query.andWhere('patient.status = :status', { status });
    }

    const [items, total] = await query
      .orderBy('patient.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: items.map((p) => {
        const fullName = `${p.firstName} ${p.lastName}`;
        return {
          id: p.id.toString(),
          name: fullName,
          firstName: p.firstName,
          lastName: p.lastName,
          initials: (p.firstName[0] + (p.lastName[0] || '')).toUpperCase(),
          avatarUrl: p.avatarUrl || null,
          city: p.city,
          gender: p.gender,
          dateOfBirth: p.dateOfBirth,
          allergy: p.allergy,
          disease: p.disease,
          contactNumber: p.contactNumber,
          email: p.email,
          lastVisit: '2025-03-19',
          status: p.status,
          createdAt: p.createdAt,
          assignedDoctorId: p.assignedDoctor?.id ?? null,
        };
      }),
      total,
    };
  }

  async createPatient(
    data: {
      firstName: string;
      lastName: string;
      gender: string;
      dateOfBirth: string;
      city?: string;
      allergy?: string;
      disease?: string;
      contactNumber?: string;
      email?: string;
    },
    actor: AuthActor,
  ) {
    const doctor = await this.doctorRepo.findOne({
      where: { id: actor.userId },
      select: ['id'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const patient = new Patient();
    patient.firstName = data.firstName;
    patient.lastName = data.lastName;
    patient.gender = data.gender;
    patient.dateOfBirth = new Date(data.dateOfBirth);
    patient.role = UserRole.PATIENT;
    patient.assignedDoctor = doctor;
    patient.city = data.city ?? '';
    patient.allergy = data.allergy ?? 'No allergies';
    patient.disease = data.disease ?? 'None';
    patient.contactNumber = data.contactNumber ?? '';
    patient.email = data.email ?? '';
    patient.status = PatientStatus.ACTIVE;
    patient.avatarUrl = '';

    const saved = await this.patientRepo.save(patient);
    return { id: saved.id };
  }

  async archivePatient(patientId: string, actor: AuthActor) {
    const query = this.patientRepo
      .createQueryBuilder('patient')
      .where('patient.id = :patientId', { patientId });

    if (actor.role === UserRole.DOCTOR) {
      query.andWhere('patient.assigned_doctor_id = :doctorId', {
        doctorId: actor.userId,
      });
    }

    const patient = await query.getOne();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (patient.status !== PatientStatus.ARCHIVED) {
      patient.status = PatientStatus.ARCHIVED;
      await this.patientRepo.save(patient);
    }

    return {
      id: patient.id,
      status: patient.status,
    };
  }

  async restorePatient(patientId: string, actor: AuthActor) {
    const query = this.patientRepo
      .createQueryBuilder('patient')
      .where('patient.id = :patientId', { patientId });

    if (actor.role === UserRole.DOCTOR) {
      query.andWhere('patient.assigned_doctor_id = :doctorId', {
        doctorId: actor.userId,
      });
    }

    const patient = await query.getOne();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (patient.status !== PatientStatus.ACTIVE) {
      patient.status = PatientStatus.ACTIVE;
      await this.patientRepo.save(patient);
    }

    return {
      id: patient.id,
      status: patient.status,
    };
  }

  async exportCsv() {
    const patients = await this.patientRepo.find({
      relations: { assignedDoctor: true },
      order: { createdAt: 'DESC' },
    });

    return patients.map((patient) => ({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email ?? '',
      city: patient.city ?? '',
      gender: patient.gender,
      disease: patient.disease ?? '',
      allergy: patient.allergy ?? '',
      status: patient.status,
      assignedDoctorId: patient.assignedDoctor?.id ?? '',
      createdAt: patient.createdAt.toISOString(),
    }));
  }
}
