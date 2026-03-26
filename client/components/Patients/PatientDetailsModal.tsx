"use client";

import { Avatar, Box, Group, Paper, Stack, Text } from "@mantine/core";
import {
  IconActivity,
  IconAlertCircle,
  IconArchive,
  IconCalendar,
  IconGenderFemale,
  IconGenderMale,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";
import { AppModal } from "@/components/AppModal/AppModal";
import { StatusChip } from "@/components/StatusChip/StatusChip";
import { Patient } from "@/hooks/patients/usePatients";
import classes from "./PatientDetailsModal.module.css";

interface PatientDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  patient: Patient | null;
}

function formatDate(date: string | Date | undefined | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getAge(date: string | Date | undefined | null): string {
  if (!date) return "";
  const birthDate = new Date(date);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} yrs`;
}

export function PatientDetailsModal({ opened, onClose, patient }: PatientDetailsModalProps) {
  if (!opened || !patient) {
    return null;
  }

  return (
    <AppModal opened={opened} onClose={onClose} title="Patient Card" size={600}>
      <Paper
        p="xl"
        withBorder
        radius="lg"
        bg="white"
        shadow="xl"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack gap="sm" mb="md">
          <Avatar
            src={patient.avatarUrl}
            size={100}
            radius={999}
            className={classes.avatar}
            fw={700}
            fz={32}
          >
            {patient.initials}
          </Avatar>
          <Box>
            <Text fw={700} fz={24} className={classes.patientName}>
              {patient.name}
            </Text>
            <Group gap="xs" mt={8}>
              <StatusChip
                label={patient.status}
                color={patient.status === "Active" ? "green" : "gray"}
                icon={
                  patient.status === "Active" ? (
                    <IconActivity size={14} />
                  ) : (
                    <IconArchive size={14} />
                  )
                }
              />
              <Text fz="xs" className={classes.mutedLabel}>
                ID: {patient.id}
              </Text>
            </Group>
          </Box>
        </Stack>

        <div className={classes.longDashedSeparator} />

        <Stack gap="xl" align="stretch" mt={10}>
          <Box>
            <Group gap="xs" mb="lg">
              <IconUser size={18} className={classes.sectionIcon} />
              <Text fw={600} fz="sm" c="dimmed">
                Personal info
              </Text>
            </Group>
            <Stack gap="md">
              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Gender
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Group gap={4} className={classes.rowValueGroup}>
                  {patient.gender === "Male" ? (
                    <IconGenderMale size={16} className={classes.sectionIcon} />
                  ) : (
                    <IconGenderFemale
                      size={16}
                      className={classes.sectionIcon}
                    />
                  )}
                  <Text fz="sm" className={classes.rowValue}>
                    {patient.gender === "Male" ? "Male" : "Female"}
                  </Text>
                </Group>
              </Box>

              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Age / Date of birth
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {getAge(patient.dateOfBirth)} ·{" "}
                  {formatDate(patient.dateOfBirth)}
                </Text>
              </Box>

              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  City
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {patient.city || "N/A"}
                </Text>
              </Box>
            </Stack>
          </Box>

          <div className={classes.longDashedSeparator} />

          <Box>
            <Group gap="xs" mb="lg">
              <IconPhone size={18} className={classes.sectionIcon} />
              <Text fw={600} fz="sm" c="dimmed">
                Contact
              </Text>
            </Group>
            <Stack gap="md">
              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Phone
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {patient.contactNumber || "N/A"}
                </Text>
              </Box>
              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Email
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {patient.email || "N/A"}
                </Text>
              </Box>
            </Stack>
          </Box>

          <div className={classes.longDashedSeparator} />

          <Box>
            <Group gap="xs" mb="lg">
              <IconAlertCircle size={18} className={classes.sectionIcon} />
              <Text fw={600} fz="sm" c="dimmed">
                Medical info
              </Text>
            </Group>
            <Stack gap="md">
              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Allergy
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {patient.allergy || "Not specified"}
                </Text>
              </Box>

              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Diagnosis / Disease
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {patient.disease || "Not specified"}
                </Text>
              </Box>
            </Stack>
          </Box>

          <div className={classes.longDashedSeparator} />

          <Box>
            <Group gap="xs" mb="lg">
              <IconCalendar size={18} className={classes.sectionIcon} />
              <Text fw={600} fz="sm" c="dimmed">
                Visits
              </Text>
            </Group>
            <Stack gap="md">
              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Last visit
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {formatDate(patient.lastVisit)}
                </Text>
              </Box>
              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Registered on
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {formatDate(patient.createdAt)}
                </Text>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </AppModal>
  );
}
