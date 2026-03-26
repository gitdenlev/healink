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
  Badge,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSearch,
  IconFilter,
  IconDots,
  IconEye,
  IconCheck,
  IconClock,
  IconCircleX,
  IconFlag,
  IconCalendarPlus,
  IconDownload,
  IconWorldWww,
  IconBuildingHospital,
} from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";
import { StatusChip } from "@/components/StatusChip/StatusChip";
import { ReactNode } from "react";
import classes from "./AppointmentsTable.module.css";
import { AppointmentItem, useAppointments } from "@/hooks/appointments/useAppointments";
import { AppointmentDetailsModal } from "./AppointmentDetailsModal";

const AVATAR_COLORS = [
  "0d9488",
  "0891b2",
  "0284c7",
  "7c3aed",
  "9333ea",
  "c026d3",
  "db2777",
  "e11d48",
];

function getAvatarUrl(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundColor=${
    AVATAR_COLORS[idx]
  }&textColor=ffffff&radius=50&fontWeight=600`;
}

const STATUS_COLORS: Record<string, string> = {
  Confirmed: "green",
  Pending: "orange",
  Completed: "blue",
  Cancelled: "red",
};

const STATUS_ICONS: Record<string, ReactNode> = {
  Confirmed: <IconCheck size={15} />,
  Pending: <IconClock size={15} />,
  Completed: <IconFlag size={15} />,
  Cancelled: <IconCircleX size={15} />,
};

const FORMAT_COLORS: Record<string, string> = {
  "In-person": "teal",
  Online: "violet",
};

const FORMAT_ICONS: Record<string, ReactNode> = {
  "In-person": <IconBuildingHospital size={15} />,
  Online: <IconWorldWww size={15} />,
};

const PAGE_SIZE = 100;
const EMPTY_APPOINTMENTS: AppointmentItem[] = [];

interface AppointmentsTableProps {
  onAddAppointment?: () => void;
  onExportCsv?: () => void;
}

export function AppointmentsTable({
  onAddAppointment,
  onExportCsv,
}: AppointmentsTableProps) {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const { isAdmin, isDoctor } = useAuth();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, search]);

  const { data, isLoading, isError } = useAppointments({
    page,
    limit: PAGE_SIZE,
    search,
    status: statusFilter,
  });

  const appointments = data?.items ?? EMPTY_APPOINTMENTS;
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleOpenDetails = useCallback((appointment: AppointmentItem) => {
    setSelectedAppointment(appointment);
    openDetails();
  }, [openDetails]);

  const handleCloseDetails = useCallback(() => {
    closeDetails();
    setSelectedAppointment(null);
  }, [closeDetails]);

  const skeletonRows = useMemo(
    () =>
      Array(8)
        .fill(0)
        .map((_, i) => (
          <Table.Tr key={`sk-${i}`}>
            <Table.Td>
              <Group gap="sm">
                <Skeleton height={36} circle />
                <Box>
                  <Skeleton height={13} width={120} mb={5} />
                  <Skeleton height={10} width={70} />
                </Box>
              </Group>
            </Table.Td>
            <Table.Td>
              <Group gap="xs">
                <Skeleton height={24} circle width={24} />
                <Skeleton height={13} width={100} />
              </Group>
            </Table.Td>
            <Table.Td>
              <Skeleton height={13} width={80} mb={5} />
              <Skeleton height={10} width={120} />
            </Table.Td>
            <Table.Td>
              <Skeleton height={24} width={90} radius="xl" />
            </Table.Td>
            <Table.Td>
              <Skeleton height={28} width={28} radius="md" />
            </Table.Td>
          </Table.Tr>
        )),
    [],
  );

  // ── Data rows ──────────────────────────────────────────────────────────────
  const dataRows = useMemo(() => appointments.map((row) => (
    <Table.Tr key={row.id} className={classes.row}>
      {/* Patient */}
      <Table.Td>
        <Group gap="sm">
          <Avatar
            src={row.patientAvatarUrl ?? getAvatarUrl(row.patient)}
            radius="xl"
            size={40}
          />
          <Box>
            <Text fw={700} fz="md" c="dark.8" lh={1.2}>
              {row.patient}
            </Text>
            <Text fz="sm" c="dark.3">
              {row.patientId ? `#${row.patientId}` : "N/A"}
            </Text>
          </Box>
        </Group>
      </Table.Td>

      {/* Doctor */}
      <Table.Td>
        <Group gap="xs">
          <Avatar
            src={row.doctorAvatarUrl ?? getAvatarUrl(row.doctor)}
            size={34}
            radius="xl"
          />
          <Box>
            <Text fz="md" fw={700} c="dark.8" lh={1.2}>
              {row.doctor}
            </Text>
            <Text fz="sm" c="dark.3">
              {row.doctorSpecialty}
            </Text>
          </Box>
        </Group>
      </Table.Td>

      {/* Service & Time */}
      <Table.Td>
        <Box>
          <Group gap={6} wrap="nowrap">
            <Text fz="md" fw={700} c="dark.8">
              {row.service}
            </Text>
            <Badge
              leftSection={FORMAT_ICONS[row.format]}
              size="xs"
              variant="light"
              color={FORMAT_COLORS[row.format]}
              radius="xl"
            >
              {row.format}
            </Badge>
          </Group>
          <Text fz="sm" c="dark.3">
            {new Date(row.date).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}{" "}
            {new Date(row.date).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" · "}
            {row.duration} min
          </Text>
        </Box>
      </Table.Td>

      {/* Status */}
      <Table.Td>
        <StatusChip
          label={row.status}
          color={STATUS_COLORS[row.status]}
          icon={STATUS_ICONS[row.status]}
        />
      </Table.Td>

      {/* Actions */}
      <Table.Td style={{ width: rem(60) }}>
        <Menu shadow="md" width={160} position="bottom-end" radius="md">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="md">
              <IconDots size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Manage Appointment</Menu.Label>
            <Menu.Item leftSection={<IconEye size={14} />} onClick={() => handleOpenDetails(row)}>
              View Details
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  )), [appointments, handleOpenDetails]);

  return (
    <>
      <Box>
      {/* Toolbar */}
      <Group justify="space-between" mb="xl">
        <TextInput
          id="appointment-search-filter"
          placeholder="Search by patient name or doctor name..."
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
              leftSection={<IconCalendarPlus size={16} />}
              onClick={onAddAppointment}
            >
              Add Appointment
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
            id="appointment-status-filter"
            placeholder="Filter status"
            clearable
            leftSection={<IconFilter size={16} stroke={1.5} />}
            data={["Confirmed", "Pending", "Completed", "Cancelled"]}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            classNames={{
              input: classes.filterSelectInput,
              dropdown: classes.filterSelectDropdown,
              option: classes.filterSelectOption,
            }}
            style={{ width: rem(180) }}
          />
        </Group>
      </Group>

      {/* Table */}
      <ScrollArea>
        <Table
          verticalSpacing="md"
          horizontalSpacing="md"
          className={classes.table}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Patient</Table.Th>
              <Table.Th>Doctor</Table.Th>
              <Table.Th>Service & Time</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isError ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" c="red" py={40} fz="sm">
                    Error loading appointments. Please try again.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : isLoading ? (
              skeletonRows
            ) : dataRows.length > 0 ? (
              dataRows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" c="dimmed" py={40} fz="sm">
                    No appointments found for your search criteria.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {/* Footer */}
      <Group justify="space-between" mt="xl" pt="md" className={classes.footer}>
        <Text fz="xs" c="dimmed">
          Displaying {appointments.length} results of {totalCount} total
          appointments
        </Text>
        {totalPages > 1 && (
          <Pagination
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-slate-200 p-2 rounded-xl shadow-lg z-50"
            total={totalPages}
            value={page}
            onChange={setPage}
            size="sm"
            radius="md"
            color="teal.6"
            withEdges
          />
        )}
      </Group>
      </Box>

      <AppointmentDetailsModal
        opened={detailsOpened}
        onClose={handleCloseDetails}
        appointment={selectedAppointment}
      />
    </>
  );
}
