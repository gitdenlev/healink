"use client";

import { Avatar, Box, Group, Paper, Stack, Text } from "@mantine/core";
import { ReactNode } from "react";
import {
  IconBuildingHospital,
  IconCalendar,
  IconCheck,
  IconCircleX,
  IconClock,
  IconCreditCard,
  IconFlag,
  IconUser,
  IconWorldWww,
} from "@tabler/icons-react";
import { AppModal } from "@/components/AppModal/AppModal";
import { StatusChip } from "@/components/StatusChip/StatusChip";
import { AppointmentItem } from "@/hooks/appointments/useAppointments";
import classes from "./AppointmentDetailsModal.module.css";

interface AppointmentDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  appointment: AppointmentItem | null;
}

const STATUS_COLORS: Record<AppointmentItem["status"], string> = {
  Confirmed: "green",
  Pending: "orange",
  Completed: "blue",
  Cancelled: "red",
};

const STATUS_ICONS: Record<AppointmentItem["status"], ReactNode> = {
  Confirmed: <IconCheck size={14} />,
  Pending: <IconClock size={14} />,
  Completed: <IconFlag size={14} />,
  Cancelled: <IconCircleX size={14} />,
};

const FORMAT_ICONS: Record<AppointmentItem["format"], ReactNode> = {
  "In-person": <IconBuildingHospital size={16} className={classes.sectionIcon} />,
  Online: <IconWorldWww size={16} className={classes.sectionIcon} />,
};

function formatDateTime(date: string) {
  const dt = new Date(date);
  return `${dt.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })} ${dt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function AppointmentDetailsModal({
  opened,
  onClose,
  appointment,
}: AppointmentDetailsModalProps) {
  if (!opened || !appointment) {
    return null;
  }

  return (
    <AppModal
      opened={opened}
      onClose={onClose}
      title="Appointment Details"
      size={600}
    >
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
          <Box>
            <Text fw={700} fz={24} className={classes.name}>
              {appointment.service}
            </Text>
            <Group gap="xs" mt={8}>
              <StatusChip
                label={appointment.status}
                color={STATUS_COLORS[appointment.status]}
                icon={STATUS_ICONS[appointment.status]}
              />
              <Text fz="xs" className={classes.mutedLabel}>
                ID: {appointment.id}
              </Text>
            </Group>
          </Box>
        </Stack>

        <Stack gap="xl" align="stretch" mt={10}>
          <Box>
            <Group gap="xs" mb="lg">
              <IconUser size={18} className={classes.sectionIcon} />
              <Text fw={600} fz="sm" c="dimmed">
                Participants
              </Text>
            </Group>
            <Stack gap="sm">
              <Box className={classes.personCard}>
                <Group gap="sm" align="center">
                  <Avatar
                    src={appointment.patientAvatarUrl ?? undefined}
                    size={42}
                    radius={999}
                    className={classes.avatar}
                    fw={700}
                  >
                    {appointment.patientInitials}
                  </Avatar>
                  <Box>
                    <Text fz="xs" className={classes.mutedLabel}>
                      Patient
                    </Text>
                    <Text fz="sm" className={classes.valueText}>
                      {appointment.patient}
                    </Text>
                    <Text fz="xs" className={classes.mutedLabel}>
                      ID: {appointment.patientId || "N/A"}
                    </Text>
                  </Box>
                </Group>
              </Box>

              <Box className={classes.personCard}>
                <Group gap="sm" align="center">
                  <Avatar
                    src={appointment.doctorAvatarUrl ?? undefined}
                    size={42}
                    radius={999}
                    className={classes.avatar}
                    fw={700}
                  >
                    {appointment.doctorInitials}
                  </Avatar>
                  <Box>
                    <Text fz="xs" className={classes.mutedLabel}>
                      Doctor
                    </Text>
                    <Text fz="sm" className={classes.valueText}>
                      {appointment.doctor}
                    </Text>
                    <Text fz="xs" className={classes.mutedLabel}>
                      ID: {appointment.doctorId || "N/A"}
                    </Text>
                    <Text fz="xs" className={classes.mutedLabel}>
                      {appointment.doctorSpecialty}
                    </Text>
                  </Box>
                </Group>
              </Box>
            </Stack>
          </Box>

          <Box>
            <Group gap="xs" mb="lg">
              <IconCalendar size={18} className={classes.sectionIcon} />
              <Text fw={600} fz="sm" c="dimmed">
                Schedule and format
              </Text>
            </Group>
            <Stack gap="md">
              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Date and time
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {formatDateTime(appointment.date)}
                </Text>
              </Box>

              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Duration
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {appointment.duration} min
                </Text>
              </Box>

              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Format
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Group gap={6} className={classes.rowValueGroup}>
                  {FORMAT_ICONS[appointment.format]}
                  <Text fz="sm" className={classes.rowValue}>
                    {appointment.format}
                  </Text>
                </Group>
              </Box>

              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Priority
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {appointment.priority}
                </Text>
              </Box>
            </Stack>
          </Box>

          <Box>
            <Group gap="xs" mb="lg">
              <IconCreditCard size={18} className={classes.sectionIcon} />
              <Text fw={600} fz="sm" c="dimmed">
                Billing
              </Text>
            </Group>
            <Stack gap="md">
              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Payment method
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {appointment.paymentMethod}
                </Text>
              </Box>

              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Price
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  ${appointment.price.toFixed(2)}
                </Text>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </AppModal>
  );
}
