import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from 'src/apps/appointments/modules/appointment/appointment.entity';
import { UserRole } from 'src/modules/admins/entities/admin.entity';
import { Doctor } from 'src/apps/doctors/modules/doctors/doctor.entity';

export enum PatientStatus {
  ACTIVE = 'Active',
  ARCHIVED = 'Archived',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 10, default: 'Male' })
  gender: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role',
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true })
  avatarUrl: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  // Single active allergy (or 'No allergies')
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    default: 'No allergies',
  })
  allergy: string;

  // Primary diagnosed disease (or 'None')
  @Column({ type: 'varchar', length: 100, nullable: true, default: 'None' })
  disease: string;

  @Column({
    name: 'contact_number',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  contactNumber: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string;

  @ManyToOne(() => Doctor, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'assigned_doctor_id' })
  assignedDoctor: Doctor | null;

  @Column({
    type: 'enum',
    enum: PatientStatus,
    enumName: 'patient_status',
    default: PatientStatus.ACTIVE,
  })
  status: PatientStatus;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
