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
import { AppModal } from "@/components/AppModal/AppModal";
import { PatientsTable } from "@/components/Patients/PatientsTable";
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
  gender: "Male",
  dateOfBirth: "",
  city: "",
  allergy: "",
  disease: "",
  contactNumber: "",
};

const MODAL_COMBOBOX_PROPS = { zIndex: 1200 };

export default function PatientsPage() {
  const [opened, setOpened] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { canCreatePatients, canExportCsv, isDoctor } = useAuth();
  const queryClient = useQueryClient();

  const handleExport = async () => {
    try {
      await downloadCsv("/api/patients/export", "patients.csv");
      event({
        action: "export_patients_csv",
        category: "Patient Management",
        label: "Export to CSV",
      });
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Export failed");
    }
  };

  const handleCreatePatient = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to create patient" }));
        throw new Error(data.error || "Failed to create patient");
      }

      await refreshCoreClinicData(queryClient);
      event({
        action: "create_patient_success",
        category: "Patient Management",
        label: `${form.firstName} ${form.lastName}`,
      });
      setOpened(false);
      setForm(INITIAL_FORM);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create patient");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container fluid p="md" bg="#fbfcfd" style={{ minHeight: '100vh' }}>
      <Stack gap="xl">
        <Group justify="space-between" align="center" mt="xs">
          <div>
            <Title order={2} fw={700} c="dark.4">Patients</Title>
            <Text fz="sm" c="dimmed" mt={4}>
              {isDoctor
                ? "Manage your own patients and linked medical records"
                : "Healthcare records and management for all registered patients"}
            </Text>
          </div>
        </Group>

        {error && (
          <Alert tone="error">
            {error}
          </Alert>
        )}

        <Paper withBorder p="lg" radius="lg" bg="white" shadow="sm" style={{ borderColor: "#f0f0f0" }}>
          <PatientsTable
            onAddPatient={canCreatePatients ? () => {
              setOpened(true);
              event({
                action: "open_add_patient_modal",
                category: "Patient Management",
              });
            } : undefined}
            onExportCsv={canExportCsv ? handleExport : undefined}
          />
        </Paper>
      </Stack>

      <AppModal opened={opened} onClose={() => setOpened(false)} title="Add Patient" size={720}>
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
          <Group grow>
            <TextInput
              label="Email"
              value={form.email}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setForm((current) => ({ ...current, email: value }));
              }}
            />
            <TextInput
              label="Contact number"
              value={form.contactNumber}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setForm((current) => ({ ...current, contactNumber: value }));
              }}
            />
          </Group>
          <Group grow>
            <Select
              label="Gender"
              comboboxProps={MODAL_COMBOBOX_PROPS}
              data={["Male", "Female"]}
              value={form.gender}
              onChange={(value) => setForm((current) => ({ ...current, gender: value || "Male" }))}
            />
            <TextInput
              type="date"
              label="Date of birth"
              value={form.dateOfBirth}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setForm((current) => ({ ...current, dateOfBirth: value }));
              }}
            />
          </Group>
          <Group grow>
            <TextInput
              label="City"
              value={form.city}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setForm((current) => ({ ...current, city: value }));
              }}
            />
          </Group>
          <Group grow>
            <TextInput
              label="Disease"
              value={form.disease}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setForm((current) => ({ ...current, disease: value }));
              }}
            />
            <TextInput
              label="Allergy"
              value={form.allergy}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setForm((current) => ({ ...current, allergy: value }));
              }}
            />
          </Group>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setOpened(false)}>Cancel</Button>
            <Button color="teal" loading={submitting} onClick={handleCreatePatient}>
              Create patient
            </Button>
          </Group>
        </Stack>
      </AppModal>
    </Container>
  );
}
