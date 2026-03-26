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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSearch,
  IconFilter,
  IconEye,
  IconTrash,
  IconBriefcase2,
  IconBeach,
  IconFirstAidKit,
  IconDotsVertical,
  IconMoodHappy,
  IconPlus,
  IconDownload,
} from "@tabler/icons-react";
import { StatusChip } from "@/components/StatusChip/StatusChip";
import { Doctor, useDoctors } from "@/hooks/doctors/useDoctors";
import { useAuth } from "@/context/AuthContext";
import classes from "./DoctorsTable.module.css";
import { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DoctorDetailsModal } from "./DoctorDetailsModal";
import { refreshCoreClinicData } from "@/lib/query-refresh";

type DoctorStatus = "On duty" | "On leave" | "Medical leave" | "Off duty";

const STATUS_CONFIG: Record<DoctorStatus, { color: string; dot: string }> = {
  "On duty": { color: "blue", dot: "var(--mantine-color--6)" },
  "On leave": { color: "orange", dot: "var(--mantine-color-orange-5)" },
  "Medical leave": { color: "red", dot: "var(--mantine-color-red-5)" },
  "Off duty": { color: "gray", dot: "var(--mantine-color-gray-5)" },
};

const STATUS_ICONS: Record<string, ReactNode> = {
  "On duty": <IconBriefcase2 size={15} />,
  "On leave": <IconBeach size={15} />,
  "Medical leave": <IconFirstAidKit size={15} />,
  "Off duty": <IconMoodHappy size={15} />,
};

const PAGE_SIZE = 10;
const EMPTY_DOCTORS: Doctor[] = [];

interface DoctorsTableProps {
  onAddDoctor?: () => void;
  onExportCsv?: () => void;
}

export function DoctorsTable({ onAddDoctor, onExportCsv }: DoctorsTableProps) {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, search]);

  const { data, isLoading } = useDoctors({
    page,
    limit: PAGE_SIZE,
    search,
    status: statusFilter,
  });

  const doctors = data?.items ?? EMPTY_DOCTORS;
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDeleteDoctor = useCallback(async (doctorId: string) => {
    setDeleteError(null);

    const res = await fetch(`/api/doctors/${doctorId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Failed to delete doctor" }));
      setDeleteError(data.error || "Failed to delete doctor");
      return;
    }

    await refreshCoreClinicData(queryClient);
  }, [queryClient]);

  const handleOpenProfile = useCallback((doctor: Doctor) => {
    setSelectedDoctor(doctor);
    openDetails();
  }, [openDetails]);

  const handleCloseProfile = useCallback(() => {
    closeDetails();
    setSelectedDoctor(null);
  }, [closeDetails]);

  const rows = useMemo(
    () =>
      doctors.map((doc) => {
        const config = STATUS_CONFIG[doc.status as DoctorStatus] || {
          color: "gray",
          dot: "gray",
        };
        return (
          <Table.Tr key={doc.id} className={classes.row}>
            <Table.Td>
              <Group gap="sm">
                <Avatar
                  src={doc.avatarUrl}
                  size={40}
                  radius="xl"
                  color={config.color}
                  variant="light"
                  fw={600}
                  fz={12}
                >
                  {doc.initials}
                </Avatar>
                <Box>
                  <Text fw={700} fz="md" c="dark.8" lh={1.2}>
                    {doc.name}
                  </Text>
                  <Text fz="sm" fw={600} c="dark.4">
                    {doc.specialty}
                  </Text>
                </Box>
              </Group>
            </Table.Td>

            <Table.Td>
              <Text fz="sm" fw={500} c="dark.3">
                {doc.email || "No email"}
              </Text>
            </Table.Td>

            <Table.Td>
              <StatusChip
                label={doc.status}
                color={config.color}
                icon={STATUS_ICONS[doc.status]}
              />
            </Table.Td>

            <Table.Td style={{ width: rem(60) }}>
              <Menu shadow="md" width={160} position="bottom-end" radius="md">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="teal" radius="md">
                    <IconDotsVertical size={20} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Manage Doctor</Menu.Label>
                  <Menu.Item leftSection={<IconEye size={14} />} onClick={() => handleOpenProfile(doc)}>
                    View Profile
                  </Menu.Item>
                  <Menu.Divider />
                  {isAdmin && (
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => handleDeleteDoctor(doc.id)}
                    >
                      Delete Doctor
                    </Menu.Item>
                  )}
                </Menu.Dropdown>
              </Menu>
            </Table.Td>
          </Table.Tr>
        );
      }),
    [doctors, handleDeleteDoctor, handleOpenProfile, isAdmin],
  );

  return (
    <>
      <Box>
      {deleteError && (
        <Text c="red" fz="sm" mb="md">
          {deleteError}
        </Text>
      )}

      <Group justify="space-between" mb="xl">
        <TextInput
          id="doctor-search-filter"
          placeholder="Search doctors by first or last name..."
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

          {isAdmin && (
            <Button
              color="teal"
              leftSection={<IconPlus size={16} />}
              onClick={onAddDoctor}
            >
              Add Doctor
            </Button>
          )}

          <Select
            id="doctor-status-filter"
            placeholder="Filter status"
            clearable
            leftSection={<IconFilter size={16} stroke={1.5} />}
            data={["On duty", "On leave", "Medical leave", "Off duty"]}
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

      <ScrollArea>
        <Table verticalSpacing="md" horizontalSpacing="md" className={classes.table}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Doctor Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Table.Tr key={i}>
                  <Table.Td>
                    <Group gap="sm">
                      <Skeleton circle height={36} />
                      <Box flex={1}>
                        <Skeleton height={14} width="60%" radius="xl" mb={4} />
                        <Skeleton height={10} width="40%" radius="xl" />
                      </Box>
                    </Group>
                  </Table.Td>
                  <Table.Td><Skeleton height={14} width="40%" radius="xl" /></Table.Td>
                  <Table.Td><Skeleton height={24} width={80} radius="xl" /></Table.Td>
                  <Table.Td><Skeleton height={24} width={24} radius="md" /></Table.Td>
                </Table.Tr>
              ))
            ) : rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text ta="center" c="dimmed" py={40} fz="sm">
                    No medical staff records found matching your criteria.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Group justify="space-between" mt="xl" pt="md" className={classes.footer}>
        <Text fz="xs" c="dimmed">
          Displaying {doctors.length} results of {total} total doctors
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

      <DoctorDetailsModal
        opened={detailsOpened}
        onClose={handleCloseProfile}
        doctor={selectedDoctor}
      />
    </>
  );
}
