import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Appointment,
  AppointmentFormat,
  AppointmentStatus,
  PaymentMethod,
} from './appointment.entity';
import { Repository } from 'typeorm';
import { AuthActor } from 'src/modules/auth/auth-actor.interface';
import { UserRole } from 'src/modules/admins/entities/admin.entity';
import { Patient } from 'src/apps/patients/modules/patients/entities/patient.entity';
import { Doctor } from 'src/apps/doctors/modules/doctors/doctor.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  async countAll(): Promise<number> {
    return this.appointmentRepo.count();
  }

  async getStats() {
    return await this.appointmentRepo
      .createQueryBuilder('appointments')
      .select('appointments.status', 'status')
      .addSelect('COUNT(appointments.id)', 'count')
      .groupBy('appointments.status')
      .getRawMany();
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    actor?: AuthActor,
  ) {
    const query = this.appointmentRepo
      .createQueryBuilder('appt')
      .leftJoin('appt.patient', 'patient')
      .leftJoin('appt.doctor', 'doctor')
      .select([
        'appt.id',
        'appt.date',
        'appt.duration',
        'appt.type',
        'appt.status',
        'appt.paymentMethod',
        'appt.format',
        'appt.priority',
        'appt.price',
        'patient.id',
        'patient.firstName',
        'patient.lastName',
        'patient.avatarUrl',
        'doctor.id',
        'doctor.firstName',
        'doctor.lastName',
        'doctor.specialty',
        'doctor.avatarUrl',
      ]);

    if (actor?.role === UserRole.DOCTOR) {
      query.andWhere('appt.doctor_id = :doctorId', { doctorId: actor.userId });
    }

    if (search) {
      const s = `%${search.toLowerCase()}%`;
      query.andWhere(
        `(LOWER(patient.firstName) LIKE :s
                OR LOWER(patient.lastName) LIKE :s
                OR LOWER(doctor.firstName) LIKE :s
                OR LOWER(doctor.lastName) LIKE :s
                OR LOWER(appt.type) LIKE :s)`,
        { s },
      );
    }

    if (status) {
      query.andWhere('appt.status = :status', { status });
    }

    const [items, total] = await query
      .orderBy('appt.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: items.map((a) => ({
        id: a.id,
        patient: a.patient
          ? `${a.patient.firstName} ${a.patient.lastName}`
          : 'Unknown',
        patientId: a.patient?.id ?? null,
        patientInitials: a.patient
          ? (a.patient.firstName[0] + a.patient.lastName[0]).toUpperCase()
          : '??',
        patientAvatarUrl: a.patient?.avatarUrl ?? null,
        doctor: a.doctor
          ? `${a.doctor.firstName} ${a.doctor.lastName}`
          : 'Unknown',
        doctorId: a.doctor?.id ?? null,
        doctorInitials: a.doctor
          ? (a.doctor.firstName[0] + a.doctor.lastName[0]).toUpperCase()
          : '??',
        doctorSpecialty: a.doctor?.specialty ?? '',
        doctorAvatarUrl: a.doctor?.avatarUrl ?? null,
        service: a.type,
        date: a.date,
        duration: a.duration,
        status: a.status,
        paymentMethod: a.paymentMethod,
        format: a.format,
        priority: a.priority,
        price: a.price,
      })),
      total,
    };
  }

  async createAppointment(
    data: {
      patientId: string;
      date: string;
      duration: number;
      type: string;
      format: Appointment['format'];
      priority: Appointment['priority'];
    },
    actor: AuthActor,
  ) {
    const [doctor, patient] = await Promise.all([
      this.doctorRepo.findOne({
        where: { id: actor.userId },
        select: ['id', 'department'],
      }),
      this.patientRepo.findOne({
        where: { id: data.patientId },
        relations: { assignedDoctor: true },
      }),
    ]);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (patient.assignedDoctor && patient.assignedDoctor.id !== actor.userId) {
      throw new BadRequestException('Patient is assigned to another doctor');
    }

    if (!patient.assignedDoctor) {
      patient.assignedDoctor = doctor;
      await this.patientRepo.save(patient);
    }

    const status = AppointmentStatus.PENDING;
    const paymentMethod = this.getRandomPaymentMethod();
    const price = this.calculatePrice(doctor.department, data.format, status);

    const appointment = this.appointmentRepo.create({
      date: new Date(data.date),
      duration: data.duration,
      type: data.type,
      format: data.format,
      priority: data.priority,
      status,
      paymentMethod,
      price,
      doctor,
      patient,
    });

    const saved = await this.appointmentRepo.save(appointment);
    return { id: saved.id };
  }

  private getRandomPaymentMethod(): PaymentMethod {
    return this.pickWeightedValue<PaymentMethod>([
      { value: PaymentMethod.CARD, weight: 45 },
      { value: PaymentMethod.INSURANCE, weight: 35 },
      { value: PaymentMethod.CASH, weight: 20 },
    ]);
  }

  private calculatePrice(
    doctorDepartment: string,
    format: Appointment['format'],
    status: Appointment['status'],
  ): number {
    const BASE_PRICES: Record<string, number> = {
      Therapy: 50,
      Pediatrics: 60,
      Cardiology: 80,
      Surgery: 150,
    };

    if (status === AppointmentStatus.CANCELLED) {
      return 0;
    }

    const basePrice = BASE_PRICES[doctorDepartment] ?? 50;
    const formatDiscount = format === AppointmentFormat.ONLINE ? 0.8 : 1;
    const variation = this.getRandomInt(-5, 5) * 2;

    return Math.max(0, Math.round(basePrice * formatDiscount + variation));
  }

  private pickWeightedValue<T>(items: Array<{ value: T; weight: number }>): T {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return item.value;
      }
    }

    return items[items.length - 1].value;
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async exportCsv() {
    const appointments = await this.appointmentRepo.find({
      relations: {
        patient: true,
        doctor: true,
      },
      order: { date: 'DESC' },
    });

    return appointments.map((appointment) => ({
      id: appointment.id,
      date: appointment.date.toISOString(),
      patient: appointment.patient
        ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
        : '',
      doctor: appointment.doctor
        ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
        : '',
      type: appointment.type,
      status: appointment.status,
      paymentMethod: appointment.paymentMethod,
      format: appointment.format,
      priority: appointment.priority,
      price: appointment.price,
      duration: appointment.duration,
    }));
  }
}
