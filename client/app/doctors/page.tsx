"use client";

import { useState } from "react";
import {
  Button,
  Container,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { Alert } from "@/components/Alert/Alert";
import { AdminOnly } from "@/components/Auth/AdminOnly";
import { AppModal } from "@/components/AppModal/AppModal";
import { DoctorsTable } from "@/components/Doctors/DoctorsTable";
import { useAuth } from "@/context/AuthContext";
import { refreshCoreClinicData } from "@/lib/query-refresh";
import { event } from "@/lib/gtag";

async function downloadCsv(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Export failed" }));
    throw new Error(data.error || "Export failed");
  }

  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  department: "Therapy",
  specialty: "Therapist",
  gender: "Male",
};

const MODAL_COMBOBOX_PROPS = { zIndex: 1200 };
const DEPARTMENT_OPTIONS = ["Therapy", "Cardiology", "Surgery", "Pediatrics"];
const SPECIALTIES_BY_DEPARTMENT: Record<string, string[]> = {
  Therapy: ["Therapist", "Gastroenterologist", "Endocrinologist"],
  Cardiology: ["Cardiologist"],
  Surgery: ["Surgeon", "Orthopedist"],
  Pediatrics: [
    "Pediatrician",
    "Neurologist",
    "Dermatologist",
    "Ophthalmologist",
  ],
};

export default function DoctorsPage() {
  const [opened, setOpened] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { canManageDoctors, canExportCsv } = useAuth();
  const queryClient = useQueryClient();

  const handleExport = async () => {
    try {
      await downloadCsv("/api/doctors/export", "doctors.csv");
      event({
        action: "export_doctors_csv",
        category: "Doctor Management",
        label: "Export to CSV",
      });
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : "Export failed"
      );
    }
  };

  const handleCreateDoctor = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Failed to create doctor" }));
        throw new Error(data.error || "Failed to create doctor");
      }

      await refreshCoreClinicData(queryClient);
      event({
        action: "create_doctor_success",
        category: "Doctor Management",
        label: `${form.firstName} ${form.lastName} - ${form.specialty}`,
      });
      setOpened(false);
      setForm(INITIAL_FORM);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create doctor"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminOnly>
      <Container fluid p="md" bg="#fbfcfd" style={{ minHeight: "100vh" }}>
        <Stack gap="xl">
          <Group justify="space-between" align="center" mt="xs">
            <div>
              <Title order={2} fw={700} c="dark.4">
                Doctors
              </Title>
              <Text fz="sm" c="dimmed" mt={4}>
                Overview and management of your clinic&apos;s medical staff
              </Text>
            </div>
          </Group>

          {error && <Alert tone="error">{error}</Alert>}

          <Paper
            withBorder
            p="lg"
            radius="lg"
            bg="white"
            shadow="sm"
            style={{ borderColor: "#f0f0f0" }}
          >
            <DoctorsTable
              onAddDoctor={canManageDoctors ? () => {
                setOpened(true);
                event({
                  action: "open_add_doctor_modal",
                  category: "Doctor Management",
                });
              } : undefined}
              onExportCsv={canExportCsv ? handleExport : undefined}
            />
          </Paper>
        </Stack>

        <AppModal
          opened={opened}
          onClose={() => setOpened(false)}
          title="Add New Doctor"
        >
          <Stack>
            <Group grow>
              <TextInput
                label="First name"
                value={form.firstName}
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  setForm((current) => ({ ...current, firstName: value }));
                }}
              />
              <TextInput
                label="Last name"
                value={form.lastName}
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  setForm((current) => ({ ...current, lastName: value }));
                }}
              />
            </Group>
            <TextInput
              label="Email"
              value={form.email}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setForm((current) => ({ ...current, email: value }));
              }}
            />
            <Group grow>
              <Select
                label="Department"
                comboboxProps={MODAL_COMBOBOX_PROPS}
                data={DEPARTMENT_OPTIONS}
                value={form.department}
                onChange={(value) => {
                  const department = value || "Therapy";
                  const specialties =
                    SPECIALTIES_BY_DEPARTMENT[department] || [];
                  const fallbackSpecialty = specialties[0] || "";

                  setForm((current) => ({
                    ...current,
                    department,
                    specialty: specialties.includes(current.specialty)
                      ? current.specialty
                      : fallbackSpecialty,
                  }));
                }}
              />
              <Select
                label="Speciality"
                comboboxProps={MODAL_COMBOBOX_PROPS}
                data={SPECIALTIES_BY_DEPARTMENT[form.department] || []}
                value={form.specialty}
                onChange={(value) =>
                  setForm((current) => ({ ...current, specialty: value || "" }))
                }
              />
            </Group>
            <Group grow>
              <Select
                label="Gender"
                comboboxProps={MODAL_COMBOBOX_PROPS}
                data={["Male", "Female"]}
                value={form.gender}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    gender: value || "Male",
                  }))
                }
              />
            </Group>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setOpened(false)}>
                Cancel
              </Button>
              <Button
                color="teal"
                loading={submitting}
                onClick={handleCreateDoctor}
              >
                Create doctor
              </Button>
            </Group>
          </Stack>
        </AppModal>
      </Container>
    </AdminOnly>
  );
}
