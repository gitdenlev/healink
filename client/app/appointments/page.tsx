"use client";

import { useEffect, useMemo, useState } from "react";
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
import { AppointmentsTable } from "@/components/Appointments/AppointmentsTable";
import { useAuth } from "@/context/AuthContext";
import { usePatients } from "@/hooks/patients/usePatients";
import { refreshCoreClinicData } from "@/lib/query-refresh";
import debounce from "lodash/debounce";

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

const SERVICE_TYPE_OPTIONS = [
  "Initial consultation",
  "Routine check-up",
  "Follow-up",
  "Vaccination",
  "ECG",
  "Stress test",
  "Pre-op consultation",
  "Post-op check-up",
  "Physical therapy",
  "X-ray review",
  "Childhood immunization",
  "Skin exam",
  "Vision correction",
  "Eye exam",
];

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function createInitialForm() {
  const start = new Date();
  start.setMinutes(start.getMinutes() + 30);
  start.setSeconds(0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  return {
    patientId: "",
    startAt: formatDateTimeLocal(start),
    endAt: formatDateTimeLocal(end),
    type: "",
    format: "In-person",
    priority: "Routine",
  };
}

const MODAL_COMBOBOX_PROPS = { zIndex: 1200 };

export default function AppointmentsPage() {
  const [opened, setOpened] = useState(false);
  const [form, setForm] = useState(createInitialForm);
  const [patientSearchInput, setPatientSearchInput] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { canCreateAppointments, canExportCsv, isDoctor } = useAuth();
  const queryClient = useQueryClient();

  const debouncedSetPatientSearch = useMemo(
    () => debounce((value: string) => setPatientSearch(value.trim()), 300),
    []
  );

  useEffect(() => {
    debouncedSetPatientSearch(patientSearchInput);
  }, [patientSearchInput, debouncedSetPatientSearch]);

  useEffect(() => {
    return () => debouncedSetPatientSearch.cancel();
  }, [debouncedSetPatientSearch]);

  const { data: patientOptionsData } = usePatients({
    page: 1,
    limit: 20,
    search: patientSearch,
    status: null,
  });

  const patientOptions = useMemo(
    () =>
      (patientOptionsData?.items || []).map((patient) => ({
        value: patient.id,
        label: `${patient.firstName} ${patient.lastName}`,
      })),
    [patientOptionsData]
  );

  const handleOpenAddAppointment = () => {
    setError(null);
    setForm(createInitialForm());
    setPatientSearchInput("");
    setPatientSearch("");
    setOpened(true);
  };

  const handleCloseModal = () => {
    setOpened(false);
    setPatientSearchInput("");
    setPatientSearch("");
  };

  const handleExport = async () => {
    try {
      await downloadCsv("/api/appointments/export", "appointments.csv");
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : "Export failed"
      );
    }
  };

  const handleCreateAppointment = async () => {
    if (!form.patientId || !form.startAt || !form.endAt || !form.type.trim()) {
      setError("Please fill in patient, start/end time, and service type.");
      return;
    }

    const startDate = new Date(form.startAt);
    const endDate = new Date(form.endAt);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setError("Please provide a valid start and end time.");
      return;
    }

    const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
    if (duration <= 0) {
      setError("End time must be later than start time.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        patientId: form.patientId,
        date: startDate.toISOString(),
        duration,
        type: form.type,
        format: form.format,
        priority: form.priority,
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Failed to create appointment" }));
        throw new Error(data.error || "Failed to create appointment");
      }

      await refreshCoreClinicData(queryClient);
      setOpened(false);
      setForm(createInitialForm());
      setPatientSearchInput("");
      setPatientSearch("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create appointment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container fluid p="md" bg="#fbfcfd" style={{ minHeight: "100vh" }}>
      <Stack gap="xl">
        <Group justify="space-between" align="center" mt="xs">
          <div>
            <Title order={2} fw={700} c="dark.4">
              Appointments
            </Title>
            <Text fz="sm" c="dimmed" mt={4}>
              {isDoctor
                ? "Create and manage appointments for your own patients"
                : "Schedule and review all clinic appointments"}
            </Text>
          </div>
        </Group>

        {error && (
          <Alert tone="error">
            {error}
          </Alert>
        )}

        <Paper
          withBorder
          p="lg"
          radius="lg"
          bg="white"
          shadow="sm"
          style={{ borderColor: "#f0f0f0" }}
        >
          <AppointmentsTable
            onAddAppointment={
              canCreateAppointments ? handleOpenAddAppointment : undefined
            }
            onExportCsv={canExportCsv ? handleExport : undefined}
          />
        </Paper>
      </Stack>

      <AppModal
        opened={opened}
        onClose={handleCloseModal}
        title="Add Appointment"
        size={720}
      >
        <Stack>
          <Select
            label="Patient"
            searchable
            comboboxProps={MODAL_COMBOBOX_PROPS}
            data={patientOptions}
            value={form.patientId}
            searchValue={patientSearchInput}
            onSearchChange={setPatientSearchInput}
            nothingFoundMessage={
              patientSearchInput ? "No patients found" : "Type to search patients"
            }
            onChange={(value, option) => {
              setForm((current) => ({ ...current, patientId: value || "" }));
              if (option?.label) {
                setPatientSearchInput(option.label);
              }
            }}
          />
          <Group grow>
            <TextInput
              type="datetime-local"
              label="Start time"
              value={form.startAt}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setForm((current) => {
                  const nextStart = new Date(value);
                  const currentEnd = new Date(current.endAt);
                  const shouldShiftEnd =
                    !current.endAt ||
                    Number.isNaN(currentEnd.getTime()) ||
                    currentEnd <= nextStart;

                  if (!shouldShiftEnd || Number.isNaN(nextStart.getTime())) {
                    return { ...current, startAt: value };
                  }

                  const nextEnd = new Date(nextStart);
                  nextEnd.setMinutes(nextEnd.getMinutes() + 30);
                  return {
                    ...current,
                    startAt: value,
                    endAt: formatDateTimeLocal(nextEnd),
                  };
                });
              }}
            />
            <TextInput
              type="datetime-local"
              label="End time"
              value={form.endAt}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setForm((current) => ({ ...current, endAt: value }));
              }}
            />
          </Group>
          <Group grow>
            <Select
              label="Service type"
              placeholder="Select service type"
              searchable
              comboboxProps={MODAL_COMBOBOX_PROPS}
              data={SERVICE_TYPE_OPTIONS}
              value={form.type}
              onChange={(value) =>
                setForm((current) => ({ ...current, type: value || "" }))
              }
            />
          </Group>
          <Group grow>
            <Select
              label="Format"
              comboboxProps={MODAL_COMBOBOX_PROPS}
              data={["In-person", "Online"]}
              value={form.format}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  format: value || "In-person",
                }))
              }
            />
            <Select
              label="Priority"
              comboboxProps={MODAL_COMBOBOX_PROPS}
              data={["Routine", "Urgent"]}
              value={form.priority}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  priority: value || "Routine",
                }))
              }
            />
          </Group>
          <Group justify="flex-end">
            <Button variant="default" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              color="teal"
              loading={submitting}
              onClick={handleCreateAppointment}
            >
              Create appointment
            </Button>
          </Group>
        </Stack>
      </AppModal>
    </Container>
  );
}
