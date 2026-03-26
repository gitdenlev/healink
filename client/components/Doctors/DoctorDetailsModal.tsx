"use client";

import { Avatar, Box, Group, Paper, Stack, Text } from "@mantine/core";
import { ReactNode } from "react";
import {
  IconBeach,
  IconBriefcase2,
  IconFirstAidKit,
  IconMail,
  IconMoodHappy,
  IconUser,
} from "@tabler/icons-react";
import { AppModal } from "@/components/AppModal/AppModal";
import { StatusChip } from "@/components/StatusChip/StatusChip";
import { Doctor } from "@/hooks/doctors/useDoctors";
import classes from "./DoctorDetailsModal.module.css";

interface DoctorDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

type DoctorStatus = "On duty" | "On leave" | "Medical leave" | "Off duty";

const STATUS_COLORS: Record<DoctorStatus, string> = {
  "On duty": "blue",
  "On leave": "orange",
  "Medical leave": "red",
  "Off duty": "gray",
};

const STATUS_ICONS: Record<DoctorStatus, ReactNode> = {
  "On duty": <IconBriefcase2 size={14} />,
  "On leave": <IconBeach size={14} />,
  "Medical leave": <IconFirstAidKit size={14} />,
  "Off duty": <IconMoodHappy size={14} />,
};

export function DoctorDetailsModal({
  opened,
  onClose,
  doctor,
}: DoctorDetailsModalProps) {
  if (!opened || !doctor) {
    return null;
  }

  const status = doctor.status as DoctorStatus;

  return (
    <AppModal
      opened={opened}
      onClose={onClose}
      title="Doctor Profile"
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
          <Avatar
            src={doctor.avatarUrl ?? undefined}
            size={100}
            radius={999}
            className={classes.avatar}
            fw={700}
            fz={32}
          >
            {doctor.initials}
          </Avatar>
          <Box>
            <Text fw={700} fz={24} className={classes.name}>
              {doctor.name}
            </Text>
            <Group gap="xs" mt={8}>
              <StatusChip
                label={doctor.status}
                color={STATUS_COLORS[status] ?? "gray"}
                icon={STATUS_ICONS[status]}
              />
              <Text fz="xs" className={classes.mutedLabel}>
                ID: {doctor.id}
              </Text>
            </Group>
          </Box>
        </Stack>


        <Stack gap="xl" align="stretch" mt={10}>
          <Box>
            <Group gap="xs" mb="lg">
              <IconUser size={18} className={classes.sectionIcon} />
              <Text fw={600} fz="sm" c="dimmed">
                Professional info
              </Text>
            </Group>
            <Stack gap="md">
              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Department
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {doctor.department || "N/A"}
                </Text>
              </Box>
              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Specialty
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {doctor.specialty || "N/A"}
                </Text>
              </Box>
            </Stack>
          </Box>

          <Box>
            <Group gap="xs" mb="lg">
              <IconMail size={18} className={classes.sectionIcon} />
              <Text fw={600} fz="sm" c="dimmed">
                Contact
              </Text>
            </Group>
            <Stack gap="md">
              <Box className={classes.infoRow}>
                <Text fz="xs" className={classes.rowLabel}>
                  Email
                </Text>
                <span className={classes.rowDots} aria-hidden />
                <Text fz="sm" className={classes.rowValue}>
                  {doctor.email || "N/A"}
                </Text>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </AppModal>
  );
}
