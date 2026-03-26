import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

import { Admin, UserRole } from 'src/modules/admins/entities/admin.entity';
import {
  Patient,
  PatientStatus,
} from 'src/apps/patients/modules/patients/entities/patient.entity';
import { Doctor, DoctorStatus } from 'src/apps/doctors/modules/doctors/doctor.entity';
import {
  Appointment,
  AppointmentStatus,
  PaymentMethod,
  AppointmentFormat,
  AppointmentPriority,
} from 'src/apps/appointments/modules/appointment/appointment.entity';
import * as bcrypt from 'bcrypt';

const TOTAL_DOCTORS = 156;
const TOTAL_PATIENTS = 10234;
const TOTAL_ADMINS = 3;
const APPOINTMENTS_PER_PATIENT_MIN = 1;
const APPOINTMENTS_PER_PATIENT_MAX = 5;
const CHUNK_SIZE = 100;

const DEPARTMENTS = ['Therapy', 'Cardiology', 'Surgery', 'Pediatrics'];

const BASE_PRICES: Record<string, number> = {
  Therapy: 50,
  Pediatrics: 60,
  Cardiology: 80,
  Surgery: 150,
};

const SPECIALTIES_BY_DEPT: Record<string, string[]> = {
  Therapy: ['Therapist', 'Gastroenterologist', 'Endocrinologist'],
  Cardiology: ['Cardiologist'],
  Surgery: ['Surgeon', 'Orthopedist'],
  Pediatrics: [
    'Pediatrician',
    'Neurologist',
    'Dermatologist',
    'Ophthalmologist',
  ],
};

const SPEC_TO_TYPES: Record<string, string[]> = {
  Therapist: ['Initial consultation', 'Routine check-up', 'Vaccination'],
  Gastroenterologist: ['Initial consultation', 'Follow-up', 'Routine check-up'],
  Endocrinologist: ['Initial consultation', 'Follow-up', 'Routine check-up'],
  Cardiologist: ['ECG', 'Follow-up', 'Stress test'],
  Surgeon: ['Pre-op consultation', 'Post-op check-up'],
  Orthopedist: ['Physical therapy', 'X-ray review'],
  Pediatrician: ['Childhood immunization', 'Routine check-up'],
  Neurologist: ['Initial consultation', 'Follow-up'],
  Dermatologist: ['Skin exam', 'Follow-up'],
  Ophthalmologist: ['Vision correction', 'Eye exam'],
};

const APPOINTMENT_DURATIONS = [15, 20, 30, 45, 60];

const DYNAMIC_CITIES = [
  { weight: 40, value: 'New York' },
  { weight: 25, value: 'Los Angeles' },
  { weight: 15, value: 'Chicago' },
  { weight: 10, value: 'Houston' },
  { weight: 5, value: 'Miami' },
  { weight: 5, value: 'San Francisco' },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSmartDate(): Date {
  const date = faker.date.between({ from: '2024-01-01', to: '2026-12-31' });
  date.setHours(randomInt(8, 17), randomInt(0, 3) * 15, 0, 0);
  return date;
}

async function seedAdmins(adminRepo: any): Promise<Admin[]> {
  console.log(`\n👑  Seeding ${TOTAL_ADMINS} admins...`);
  const admins: Admin[] = [];
  const hashedPassword = await bcrypt.hash('healink123', 10);

  const adminEmails = [
    'admin@healink.com',
    'manager@healink.com',
    'support@healink.com',
  ];

  for (let i = 0; i < TOTAL_ADMINS; i++) {
    const admin = new Admin();
    admin.firstName = faker.person.firstName();
    admin.lastName = faker.person.lastName();
    admin.email = adminEmails[i] || faker.internet.email().toLowerCase();
    admin.password = hashedPassword;
    admin.role = UserRole.ADMIN;
    admin.avatarUrl = `https://i.pravatar.cc/150?u=admin-${i}`;
    admins.push(admin);
  }

  const saved = await adminRepo.save(admins);
  console.log(`   ✅ ${saved.length} admins saved.`);
  return saved;
}

async function seedDoctors(doctorRepo: any): Promise<Doctor[]> {
  console.log(
    `\n👨‍⚕️  Seeding ${TOTAL_DOCTORS} doctors in chunks of ${CHUNK_SIZE}...`,
  );
  const allSaved: Doctor[] = [];
  const hashedPassword = await bcrypt.hash('healink123', 10);

  for (let offset = 0; offset < TOTAL_DOCTORS; offset += CHUNK_SIZE) {
    const chunk: Doctor[] = [];
    const batchSize = Math.min(CHUNK_SIZE, TOTAL_DOCTORS - offset);

    for (let i = 0; i < batchSize; i++) {
      const idx = offset + i;
      const doc = new Doctor();
      doc.firstName = faker.person.firstName();
      doc.lastName = faker.person.lastName();
      doc.gender = faker.helpers.arrayElement(['Male', 'Female']);
      doc.role = UserRole.DOCTOR;
      doc.email = doc.firstName.toLowerCase() + idx + '@healink.com';
      doc.password = hashedPassword;
      doc.avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(doc.firstName + ' ' + doc.lastName)}&radius=50&fontWeight=600`;
      doc.department = faker.helpers.arrayElement(DEPARTMENTS);
      doc.specialty = faker.helpers.arrayElement(
        SPECIALTIES_BY_DEPT[doc.department],
      );
      doc.experienceYears = faker.helpers.weightedArrayElement([
        { weight: 30, value: randomInt(1, 5) },
        { weight: 50, value: randomInt(6, 15) },
        { weight: 20, value: randomInt(16, 35) },
      ]);
      doc.status = faker.helpers.weightedArrayElement([
        { weight: 85, value: DoctorStatus.ON_DUTY },
        { weight: 5, value: DoctorStatus.ON_LEAVE },
        { weight: 5, value: DoctorStatus.MEDICAL_LEAVE },
        { weight: 5, value: DoctorStatus.OFF_DUTY },
      ]);

      chunk.push(doc);
    }
    const saved = await doctorRepo.save(chunk);
    allSaved.push(...saved);
    process.stdout.write(
      `\r   ✅ ${allSaved.length}/${TOTAL_DOCTORS} doctors saved.`,
    );
  }

  console.log('');
  return allSaved;
}

async function seedPatients(
  patientRepo: any,
  doctors: Doctor[],
): Promise<Patient[]> {
  console.log(
    `\n🧑‍🤝‍🧑 Seeding ${TOTAL_PATIENTS} patients in chunks of ${CHUNK_SIZE}...`,
  );
  const allSaved: Patient[] = [];

  for (let offset = 0; offset < TOTAL_PATIENTS; offset += CHUNK_SIZE) {
    const chunk: Patient[] = [];
    const batchSize = Math.min(CHUNK_SIZE, TOTAL_PATIENTS - offset);

    for (let j = 0; j < batchSize; j++) {
      const p = new Patient();
      p.firstName = faker.person.firstName();
      p.lastName = faker.person.lastName();
      p.gender = faker.helpers.arrayElement(['Male', 'Female']);
      p.role = UserRole.PATIENT;
      p.dateOfBirth = faker.date.birthdate({ min: 18, max: 80, mode: 'age' });
      p.city = faker.helpers.weightedArrayElement(DYNAMIC_CITIES);
      p.allergy = faker.helpers.weightedArrayElement([
        { weight: 60, value: 'No allergies' },
        { weight: 15, value: 'Penicillin' },
        { weight: 10, value: 'Lactose' },
        { weight: 10, value: 'Almonds' },
        { weight: 5, value: 'Pilocarpine' },
      ]);
      p.disease = faker.helpers.weightedArrayElement([
        { weight: 50, value: 'None' },
        { weight: 15, value: 'Hypertension' },
        { weight: 15, value: 'Diabetes' },
        { weight: 10, value: 'Asthma' },
        { weight: 5, value: 'Arthritis' },
        { weight: 5, value: 'Other' },
      ]);
      p.contactNumber = faker.phone.number({ style: 'international' });
      p.email = faker.internet
        .email({ firstName: p.firstName, lastName: p.lastName })
        .toLowerCase()
        .replace('@', `${faker.string.alphanumeric(4)}@`);
      p.assignedDoctor = faker.helpers.arrayElement(doctors);
      p.status = faker.helpers.weightedArrayElement([
        { weight: 95, value: PatientStatus.ACTIVE },
        { weight: 5, value: PatientStatus.ARCHIVED },
      ]);

      chunk.push(p);
    }

    const saved = await patientRepo.save(chunk);
    allSaved.push(...saved);
    process.stdout.write(
      `\r   ✅ ${allSaved.length}/${TOTAL_PATIENTS} patients saved.`,
    );
  }

  console.log('');
  return allSaved;
}

async function seedAppointments(
  appointmentRepo: any,
  patients: Patient[],
  doctors: Doctor[],
): Promise<void> {
  console.log(`\n📅 Seeding appointments with financial logic...`);
  let totalCount = 0;
  const buffer: Appointment[] = [];
  const topDoctors = doctors.slice(0, 5);

  for (const patient of patients) {
    const count = randomInt(
      APPOINTMENTS_PER_PATIENT_MIN,
      APPOINTMENTS_PER_PATIENT_MAX,
    );

    for (let k = 0; k < count; k++) {
      const doc =
        patient.assignedDoctor ??
        (Math.random() < 0.3
          ? faker.helpers.arrayElement(topDoctors)
          : faker.helpers.arrayElement(doctors));

      const appt = new Appointment();
      appt.patient = patient;
      appt.doctor = doc;
      appt.date = getSmartDate();
      appt.duration = faker.helpers.arrayElement(APPOINTMENT_DURATIONS);
      appt.type = faker.helpers.arrayElement(
        SPEC_TO_TYPES[doc.specialty] ?? ['Consultation'],
      );
      appt.status = faker.helpers.weightedArrayElement([
        { weight: 55, value: AppointmentStatus.COMPLETED },
        { weight: 25, value: AppointmentStatus.CONFIRMED },
        { weight: 10, value: AppointmentStatus.PENDING },
        { weight: 10, value: AppointmentStatus.CANCELLED },
      ]);
      appt.paymentMethod = faker.helpers.weightedArrayElement([
        { weight: 45, value: PaymentMethod.CARD },
        { weight: 35, value: PaymentMethod.INSURANCE },
        { weight: 20, value: PaymentMethod.CASH },
      ]);
      appt.format = faker.helpers.weightedArrayElement([
        { weight: 80, value: AppointmentFormat.IN_PERSON },
        { weight: 20, value: AppointmentFormat.ONLINE },
      ]);
      appt.priority = faker.helpers.weightedArrayElement([
        { weight: 85, value: AppointmentPriority.ROUTINE },
        { weight: 15, value: AppointmentPriority.URGENT },
      ]);

      const basePrice = BASE_PRICES[doc.department] ?? 50;
      const formatDiscount = appt.format === AppointmentFormat.ONLINE ? 0.8 : 1;
      const variation = randomInt(-5, 5) * 2;
      appt.price =
        appt.status === AppointmentStatus.CANCELLED
          ? 0
          : Math.max(0, Math.round(basePrice * formatDiscount + variation));

      buffer.push(appt);

      if (buffer.length >= CHUNK_SIZE) {
        await appointmentRepo.save(buffer);
        totalCount += buffer.length;
        buffer.length = 0;
        process.stdout.write(`\r   ✅ ${totalCount} appointments saved...`);
      }
    }
  }

  if (buffer.length > 0) {
    await appointmentRepo.save(buffer);
    totalCount += buffer.length;
  }

  console.log(`\n   ✅ ${totalCount} total appointments saved.`);
}

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Admin, Patient, Doctor, Appointment],
  synchronize: false,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  logging: false,
});

async function runSeed() {
  console.log('🌱 Connecting to database...');
  await AppDataSource.initialize();
  console.log('✅ Connected.\n');

  const adminRepo = AppDataSource.getRepository(Admin);
  const doctorRepo = AppDataSource.getRepository(Doctor);
  const patientRepo = AppDataSource.getRepository(Patient);
  const appointmentRepo = AppDataSource.getRepository(Appointment);

  console.log('🧹 Cleaning up DB...');
  await AppDataSource.query(
    'TRUNCATE TABLE appointments, patients, doctors, admins RESTART IDENTITY CASCADE',
  );
  console.log('   ✅ Tables cleared.\n');

  await seedAdmins(adminRepo);
  const doctors = await seedDoctors(doctorRepo);
  const patients = await seedPatients(patientRepo, doctors);
  await seedAppointments(appointmentRepo, patients, doctors);

  await AppDataSource.destroy();

  console.log('\n🎉 Seed completed successfully!');
  console.log(`   Admins:       ${TOTAL_ADMINS}`);
  console.log(`   Doctors:      ${TOTAL_DOCTORS}`);
  console.log(`   Patients:     ${TOTAL_PATIENTS}`);
  console.log(
    `   Appointments: ${APPOINTMENTS_PER_PATIENT_MIN}–${APPOINTMENTS_PER_PATIENT_MAX} per patient`,
  );
}

runSeed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
