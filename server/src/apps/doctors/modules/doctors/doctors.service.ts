import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor, DoctorStatus } from './doctor.entity';
import { Repository } from 'typeorm';
import { Patient } from 'src/apps/patients/modules/patients/entities/patient.entity';
import { Appointment } from 'src/apps/appointments/modules/appointment/appointment.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  async countAll(): Promise<number> {
    return this.doctorRepo.count();
  }

  async getStats() {
    return await this.doctorRepo
      .createQueryBuilder('doctor')
      .select('doctor.status', 'status')
      .addSelect('COUNT(doctor.id)', 'count')
      .groupBy('doctor.status')
      .getRawMany();
  }

  async findAll(page: number, limit: number, search?: string, status?: string) {
    const query = this.doctorRepo
      .createQueryBuilder('doctor')
      .select([
        'doctor.id',
        'doctor.firstName',
        'doctor.lastName',
        'doctor.email',
        'doctor.department',
        'doctor.specialty',
        'doctor.avatarUrl',
        'doctor.status',
      ]);

    if (search) {
      const s = `%${search.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(doctor.firstName) LIKE :s OR LOWER(doctor.lastName) LIKE :s OR LOWER(doctor.specialty) LIKE :s)',
        { s },
      );
    }

    if (status) {
      query.andWhere('doctor.status = :status', { status });
    }

    const [items, total] = await query
      .orderBy('doctor.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: items.map((d) => {
        const fullName = `${d.firstName} ${d.lastName}`;
        return {
          id: d.id.toString(),
          name: fullName,
          firstName: d.firstName,
          lastName: d.lastName,
          email: d.email,
          initials: (d.firstName[0] + (d.lastName[0] || '')).toUpperCase(),
          department: d.department,
          specialty: d.specialty,
          avatarUrl: d.avatarUrl,
          patients: 124, // Mock for now
          status: d.status,
        };
      }),
      total,
    };
  }

  async createDoctor(data: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    department: string;
    specialty: string;
    gender?: string;
    avatarUrl?: string | null;
  }) {
    const existingDoctor = await this.doctorRepo.findOne({
      where: { email: data.email },
      select: ['id'],
    });

    if (existingDoctor) {
      throw new RpcException('Doctor with this email already exists');
    }

    const doctor = new Doctor();
    doctor.firstName = data.firstName;
    doctor.lastName = data.lastName;
    doctor.email = data.email;
    const passwordToHash = data.password?.trim() || randomUUID();
    doctor.password = await bcrypt.hash(passwordToHash, 10);
    doctor.department = data.department;
    doctor.specialty = data.specialty;
    doctor.gender = data.gender ?? 'Male';
    doctor.status = DoctorStatus.ON_DUTY;
    doctor.avatarUrl = data.avatarUrl ?? '';

    const saved = await this.doctorRepo.save(doctor);
    return {
      id: saved.id,
      firstName: saved.firstName,
      lastName: saved.lastName,
      email: saved.email,
      department: saved.department,
      specialty: saved.specialty,
      status: saved.status,
    };
  }

  async deleteDoctor(doctorId: string) {
    const doctor = await this.doctorRepo.findOne({
      where: { id: doctorId },
      select: ['id'],
    });

    if (!doctor) {
      throw new RpcException('Doctor not found');
    }

    const [linkedPatients, linkedAppointments] = await Promise.all([
      this.patientRepo.count({
        where: { assignedDoctor: { id: doctorId } },
      }),
      this.appointmentRepo.count({
        where: { doctor: { id: doctorId } },
      }),
    ]);

    if (linkedPatients > 0 || linkedAppointments > 0) {
      throw new RpcException(
        'Doctor cannot be deleted while linked patients or appointments exist',
      );
    }

    await this.doctorRepo.delete(doctorId);
    return { success: true };
  }

  async exportCsv() {
    const doctors = await this.doctorRepo.find({
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'department',
        'specialty',
        'status',
        'createdAt',
      ],
      order: { createdAt: 'DESC' },
    });

    return doctors.map((doctor) => ({
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      department: doctor.department,
      specialty: doctor.specialty,
      status: doctor.status,
      createdAt: doctor.createdAt.toISOString(),
    }));
  }
}
