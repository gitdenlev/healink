"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  ScrollArea,
  Group,
  Text,
  TextInput,
  rem,
  Avatar,
  Pagination,
  Box,
  Select,
  ActionIcon,
  Menu,
  Skeleton,
  Button,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  IconSearch,
  IconFilter,
  IconDots,
  IconEye,
  IconActivity,
  IconArchive,
  IconUserPlus,
  IconDownload,
} from "@tabler/icons-react";
import { StatusChip } from "@/components/StatusChip/StatusChip";
import { usePatients, Patient } from "@/hooks/patients/usePatients";
import { PatientDetailsModal } from "./PatientDetailsModal";
import { useAuth } from "@/context/AuthContext";
import { refreshCoreClinicData } from "@/lib/query-refresh";
import { event } from "@/lib/gtag";
import classes from "./PatientsTable.module.css";

function getAvatarUrl(name: string): string {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundColor=0d9488&textColor=ffffff&radius=50&fontWeight=600`;
}

const STATUS_ICONS = {
  Active: <IconActivity size={15} />,
  Archived: <IconArchive size={15} />,
};

const PAGE_SIZE = 100;

interface PatientsTableProps {
  onAddPatient?: () => void;
  onExportCsv?: () => void;
}

export function PatientsTable({
  onAddPatient,
  onExportCsv,
}: PatientsTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput);
        setPage(1);
        if (searchInput) {
          event({
            action: "search_patients",
            category: "Patient Management",
            label: searchInput,
          });
        }
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, search]);

  const { data, isLoading } = usePatients({
    page,
    limit: PAGE_SIZE,
    search,
    status: statusFilter || undefined,
  });

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [processingPatientId, setProcessingPatientId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { isDoctor, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const handleOpenModal = useCallback(
    (patient: Patient) => {
      setSelectedPatient(patient);
      open();
      event({
        action: "view_medical_card",
        category: "Patient Management",
        label: `${patient.firstName} ${patient.lastName}`,
      });
    },
    [open]
  );

  const handleCloseModal = useCallback(() => {
    close();
    setSelectedPatient(null);
  }, [close]);

  const handleArchivePatient = useCallback(async (patient: Patient) => {
    if (patient.status === "Archived") {
      return;
    }

    const confirmed = window.confirm(
      `Archive patient ${patient.firstName} ${patient.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    setActionError(null);
    setProcessingPatientId(patient.id);

    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Failed to archive patient" }));
        throw new Error(data.error || "Failed to archive patient");
      }

      await refreshCoreClinicData(queryClient);
      event({
        action: "archive_patient",
        category: "Patient Management",
        label: `${patient.firstName} ${patient.lastName}`,
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to archive patient"
      );
    } finally {
      setProcessingPatientId(null);
    }
  }, [queryClient]);

  const handleRestorePatient = useCallback(async (patient: Patient) => {
    if (patient.status !== "Archived") {
      return;
    }

    const confirmed = window.confirm(
      `Restore patient ${patient.firstName} ${patient.lastName} from archive?`
    );

    if (!confirmed) {
      return;
    }

    setActionError(null);
    setProcessingPatientId(patient.id);

    try {
      const res = await fetch(`/api/patients/${patient.id}/restore`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Failed to restore patient" }));
        throw new Error(data.error || "Failed to restore patient");
      }

      await refreshCoreClinicData(queryClient);
      event({
        action: "restore_patient",
        category: "Patient Management",
        label: `${patient.firstName} ${patient.lastName}`,
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to restore patient"
      );
    } finally {
      setProcessingPatientId(null);
    }
  }, [queryClient]);

  const rows = useMemo(() => {
    if (isLoading) {
      return Array(5)
        .fill(0)
        .map((_, index) => (
          <Table.Tr key={index}>
            <Table.Td>
              <Group gap="sm">
                <Skeleton height={32} circle />
                <Skeleton height={12} width={120} radius="xl" />
              </Group>
            </Table.Td>
            <Table.Td>
              <Stack gap={4}>
                <Skeleton height={10} width={150} radius="xl" />
                <Skeleton height={10} width={100} radius="xl" />
              </Stack>
            </Table.Td>
            <Table.Td>
              <Skeleton height={24} width={80} radius="xl" />
            </Table.Td>
            <Table.Td>
              <Skeleton height={28} width={28} radius="md" />
            </Table.Td>
          </Table.Tr>
        ));
    }

    return data?.items.map((row) => (
      <Table.Tr key={row.id}>
        <Table.Td>
          <Group gap="sm">
            <Avatar
              size={40}
              src={
                row.avatarUrl ||
                getAvatarUrl(`${row.firstName} ${row.lastName}`)
              }
              radius="xl"
            />
            <Text size="md" fw={600}>
              {row.firstName} {row.lastName}
            </Text>
          </Group>
        </Table.Td>

        <Table.Td>
          <Box>
            <Text
              size="sm"
              c="dimmed"
              style={{ display: "block", lineHeight: 1.4 }}
            >
              {row.email || "No email"}
            </Text>
            <Text size="sm" c="dimmed" style={{ lineHeight: 1.4 }}>
              {row.contactNumber || "No phone number"}
            </Text>
          </Box>
        </Table.Td>

        <Table.Td>
          <StatusChip
            label={row.status}
            color={row.status === "Active" ? "green" : "gray"}
            icon={STATUS_ICONS[row.status as keyof typeof STATUS_ICONS]}
          />
        </Table.Td>

        <Table.Td style={{ width: rem(60) }}>
          <Menu
            shadow="md"
            width={180}
            position="bottom-end"
            radius="md"
            withArrow
          >
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" radius="md">
                <IconDots size={18} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Patient management</Menu.Label>
              <Menu.Item
                leftSection={<IconEye size={14} />}
                onClick={() => handleOpenModal(row)}
              >
                View medical card
              </Menu.Item>
              {isDoctor && row.status !== "Archived" && (
                <Menu.Item
                  color="red"
                  leftSection={<IconArchive size={14} />}
                  disabled={processingPatientId === row.id}
                  onClick={() => handleArchivePatient(row)}
                >
                  Move to archive
                </Menu.Item>
              )}
              {isDoctor && row.status === "Archived" && (
                <Menu.Item
                  color="teal"
                  leftSection={<IconActivity size={14} />}
                  disabled={processingPatientId === row.id}
                  onClick={() => handleRestorePatient(row)}
                >
                  Restore from archive
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    ));
  }, [data?.items, handleOpenModal, isLoading, isDoctor, processingPatientId, handleArchivePatient, handleRestorePatient]);

  return (
    <>
      <Box>
        {actionError && (
          <Text c="red" fz="sm" mb="sm">
            {actionError}
          </Text>
        )}
        <Group justify="space-between" mb="xl">
          <TextInput
            placeholder="Search patients by first or last name..."
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={searchInput}
            onChange={(e) => {
              const value = e.currentTarget.value;
              setSearchInput(value);
            }}
            classNames={{ input: classes.searchInput }}
            style={{ flex: 1, maxWidth: rem(400) }}
          />

          <Group gap="sm">
            {isDoctor && (
              <Button
                color="teal"
                leftSection={<IconUserPlus size={18} />}
                onClick={onAddPatient}
              >
                Add Patient
              </Button>
            )}

            {isAdmin && (
              <Button
                variant="light"
                color="teal"
                leftSection={<IconDownload size={16} />}
                onClick={onExportCsv}
              >
                Export to CSV
              </Button>
            )}

            <Select
              placeholder="Filter status"
              clearable
              leftSection={<IconFilter size={16} stroke={1.5} />}
              data={["Active", "Archived"]}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
                event({
                  action: "filter_patients_status",
                  category: "Patient Management",
                  label: value || "All",
                });
              }}
              classNames={{
                input: classes.filterSelectInput,
                dropdown: classes.filterSelectDropdown,
                option: classes.filterSelectOption,
              }}
              style={{ width: rem(150) }}
            />
          </Group>
        </Group>

        <ScrollArea h={600}>
          <Table
            verticalSpacing="sm"
            className={classes.table}
            highlightOnHover
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Patient</Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </ScrollArea>

        {data && data.total > PAGE_SIZE && (
          <Box mt="xl" className="flex justify-center">
            <Pagination
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-slate-200 p-2 rounded-xl shadow-lg z-50"
              total={Math.ceil(data.total / PAGE_SIZE)}
              value={page}
              onChange={setPage}
              color="teal"
              radius="md"
              withEdges
            />
          </Box>
        )}
      </Box>

      <PatientDetailsModal
        opened={opened}
        onClose={handleCloseModal}
        patient={selectedPatient}
      />
    </>
  );
}
