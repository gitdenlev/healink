import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from 'src/apps/doctors/modules/doctors/doctor.entity';
import { Patient } from 'src/apps/patients/modules/patients/entities/patient.entity';

export enum AppointmentStatus {
  COMPLETED = 'Completed',
  CONFIRMED = 'Confirmed',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
}

export enum PaymentMethod {
  CARD = 'Card',
  INSURANCE = 'Insurance',
  CASH = 'Cash',
}

export enum AppointmentFormat {
  IN_PERSON = 'In-person',
  ONLINE = 'Online',
}

export enum AppointmentPriority {
  ROUTINE = 'Routine',
  URGENT = 'Urgent',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'int' })
  duration: number; // minutes

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    enumName: 'appointment_status',
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    enumName: 'payment_method',
    default: PaymentMethod.CARD,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: AppointmentFormat,
    enumName: 'appointment_format',
    default: AppointmentFormat.IN_PERSON,
  })
  format: AppointmentFormat;

  @Column({
    type: 'enum',
    enum: AppointmentPriority,
    enumName: 'appointment_priority',
    default: AppointmentPriority.ROUTINE,
  })
  priority: AppointmentPriority;

  @Column({ type: 'int', default: 0 })
  price: number; // in USD (cents-free, rounded)

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
