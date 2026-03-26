-- ═══════════════════════════════════════════════════════════════
-- Healink — PostgreSQL initialisation script
-- Runs automatically when the postgres container starts for the
-- first time (mounted to /docker-entrypoint-initdb.d/).
-- ═══════════════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram full-text search

-- ── Enums ────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'DOCTOR', 'PATIENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE doctor_status AS ENUM ('On duty', 'On leave', 'Medical leave', 'Off duty');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE patient_status AS ENUM ('Active', 'Archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('Completed', 'Confirmed', 'Pending', 'Cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('Card', 'Insurance', 'Cash');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_format AS ENUM ('In-person', 'Online');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_priority AS ENUM ('Routine', 'Urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Tables ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  role       user_role    NOT NULL DEFAULT 'ADMIN',
  avatar_url VARCHAR(255),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS doctors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name       VARCHAR(100) NOT NULL,
  last_name        VARCHAR(100) NOT NULL,
  gender           VARCHAR(10)  NOT NULL DEFAULT 'Male',
  role             user_role    NOT NULL DEFAULT 'DOCTOR',
  avatar_url       VARCHAR(255),
  department       VARCHAR(100) NOT NULL,
  specialty        VARCHAR(100) NOT NULL,
  experience_years INT          NOT NULL DEFAULT 0,
  status           doctor_status NOT NULL DEFAULT 'On duty',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patients (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name     VARCHAR(100) NOT NULL,
  last_name      VARCHAR(100) NOT NULL,
  gender         VARCHAR(10)  NOT NULL DEFAULT 'Male',
  role           user_role    NOT NULL DEFAULT 'PATIENT',
  date_of_birth  DATE         NOT NULL,
  city           VARCHAR(100),
  allergy        VARCHAR(100) DEFAULT 'No allergies',
  disease        VARCHAR(100) DEFAULT 'None',
  contact_number VARCHAR(30),
  email          VARCHAR(150),
  assigned_doctor_id UUID REFERENCES doctors(id) ON DELETE RESTRICT,
  status         patient_status NOT NULL DEFAULT 'Active',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date           TIMESTAMP    NOT NULL,
  duration       INT          NOT NULL,
  type           VARCHAR(100) NOT NULL,
  status         appointment_status   NOT NULL DEFAULT 'Pending',
  payment_method payment_method       NOT NULL DEFAULT 'Card',
  format         appointment_format   NOT NULL DEFAULT 'In-person',
  priority       appointment_priority NOT NULL DEFAULT 'Routine',
  price          INT          NOT NULL DEFAULT 0,
  doctor_id      UUID REFERENCES doctors(id)  ON DELETE SET NULL,
  patient_id     UUID REFERENCES patients(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── Indexes (performance) ─────────────────────────────────────────

-- Appointments: most frequent query patterns
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id  ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status     ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date       ON appointments(date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_format     ON appointments(format);

-- Patients search
CREATE INDEX IF NOT EXISTS idx_patients_status        ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_city          ON patients(city);
CREATE INDEX IF NOT EXISTS idx_patients_assigned_doctor_id ON patients(assigned_doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_name_trgm     ON patients USING gin (
  (lower(first_name) || ' ' || lower(last_name)) gin_trgm_ops
);

-- Doctors search
CREATE INDEX IF NOT EXISTS idx_doctors_status         ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_doctors_department     ON doctors(department);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty      ON doctors(specialty);

-- ── Updated-at trigger ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ 
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['admins', 'doctors', 'patients', 'appointments']
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
      t
    );
  END LOOP;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
