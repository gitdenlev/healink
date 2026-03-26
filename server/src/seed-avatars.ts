import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Patient } from 'src/apps/patients/modules/patients/entities/patient.entity';
import { Admin } from 'src/modules/admins/entities/admin.entity';
import { Doctor } from 'src/apps/doctors/modules/doctors/doctor.entity';
import { Appointment } from 'src/apps/appointments/modules/appointment/appointment.entity';

const CHUNK_SIZE = 500;

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'healink',
  entities: [Admin, Patient, Doctor, Appointment],
  synchronize: false,
  logging: false,
});

async function updatePatientAvatars() {
  console.log('🌱 Connecting to database...');
  try {
    await AppDataSource.initialize();
    console.log('✅ Connected.\n');
  } catch (error) {
    console.error(
      '❌ Failed to connect to DB. Check if your database is running and credentials are correct.',
    );
    console.error(error.message);
    process.exit(1);
  }

  const patientRepo = AppDataSource.getRepository(Patient);

  const totalPatients = await patientRepo.count();
  console.log(`🧑‍🤝‍🧑 Total patients to update: ${totalPatients}`);

  if (totalPatients === 0) {
    console.log(
      'ℹ️ No patients found in the database. Run the main seed script first.',
    );
    await AppDataSource.destroy();
    return;
  }

  for (let offset = 0; offset < totalPatients; offset += CHUNK_SIZE) {
    const patients = await patientRepo.find({
      skip: offset,
      take: CHUNK_SIZE,
      order: { id: 'ASC' },
    });

    for (const p of patients) {
      const seed = p.id.split('-')[0];
      p.avatarUrl = `https://i.pravatar.cc/150?u=${seed}`;
    }

    await patientRepo.save(patients);
    process.stdout.write(
      `\r   ✅ ${Math.min(offset + CHUNK_SIZE, totalPatients)}/${totalPatients} patients updated.`,
    );
  }

  console.log('\n\n🎉 All patient avatars have been generated and saved!');
  await AppDataSource.destroy();
}

updatePatientAvatars().catch((err) => {
  console.error('\n❌ Unexpected error during update:', err);
  process.exit(1);
});
