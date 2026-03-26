import { Grid, Stack, Skeleton, Group } from "@mantine/core";
import { 
  IconCurrencyDollar, 
  IconCalendarEvent, 
  IconFlag, 
  IconCheck, 
  IconClock, 
  IconCircleX, 
  IconHourglass 
} from "@tabler/icons-react";
import { useAppointmentsTotal } from "@/hooks/appointments/useAppointmentsTotal";
import { useAppointmentsStats } from "@/hooks/appointments/useAppointmentsStats";
import { ChartCard } from "../Dashboard/ChartCard";
import { CustomDonutChart } from "../Dashboard/CustomDonutChart";
import {
  useAppointmentsByType,
  useAppointmentsByPaymentMethod,
  useAppointmentsByStatus,
  useAppointmentsByFormat,
  useAppointmentsByPriority,
  useAppointmentsAvgPrice,
  useAppointmentsTotalRevenue,
  useAppointmentsAvgDuration,
} from "@/hooks/analytics/appointments/useAppointmentsAnalytics";
import { StatsCard } from "../StatsCard/StatsCard";

function MetricCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <StatsCard
      title={label}
      value={value}
      icon={icon}
      bg={color}
    />
  );
}

export function AppointmentsStatsSection() {
  const { data: byType, isLoading: isLoadingType } = useAppointmentsByType();
  const { data: byPayment, isLoading: isLoadingPayment } = useAppointmentsByPaymentMethod();
  const { data: byStatus, isLoading: isLoadingStatus } = useAppointmentsByStatus();
  const { data: byFormat, isLoading: isLoadingFormat } = useAppointmentsByFormat();
  const { data: byPriority, isLoading: isLoadingPriority } = useAppointmentsByPriority();
  const { data: avgPrice, isLoading: isLoadingAvgPrice } = useAppointmentsAvgPrice();
  const { data: totalRevenue, isLoading: isLoadingRevenue } = useAppointmentsTotalRevenue();
  const { data: totalAppointments, isLoading: isLoadingTotal } = useAppointmentsTotal();
  const { data: stats, isLoading: isLoadingStats } = useAppointmentsStats();
  const { data: avgDuration, isLoading: isLoadingDuration } = useAppointmentsAvgDuration();

  const mainStats = [
    { 
      title: "Total appointments", 
      value: totalAppointments?.toLocaleString() || "0", 
      icon: <IconCalendarEvent size={20} />, 
      bg: "teal",
      loading: isLoadingTotal
    },
    { 
      title: "Completed", 
      value: stats?.completed?.toLocaleString() || "0", 
      icon: <IconFlag size={20} />, 
      bg: "blue",
      loading: isLoadingStats
    },
    { 
      title: "Confirmed", 
      value: stats?.confirmed?.toLocaleString() || "0", 
      icon: <IconCheck size={20} />, 
      bg: "green",
      loading: isLoadingStats
    },
    { 
      title: "Pending", 
      value: stats?.pending?.toLocaleString() || "0", 
      icon: <IconClock size={20} />, 
      bg: "orange",
      loading: isLoadingStats
    },
    { 
      title: "Cancelled", 
      value: stats?.cancelled?.toLocaleString() || "0", 
      icon: <IconCircleX size={20} />, 
      bg: "red",
      loading: isLoadingStats
    },
    {
      title: "Avg. Duration",
      value: avgDuration != null ? `${avgDuration} min` : "0",
      icon: <IconHourglass size={20} />,
      bg: "violet",
      loading: isLoadingDuration
    },
  ];

  return (
    <Stack gap="xl">
      {/* ─── Main Stats row ─── */}
      <Grid gutter="md">
        {mainStats.map((s) => (
          <Grid.Col key={s.title} span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
            {s.loading ? (
              <Skeleton height={120} radius="lg" />
            ) : (
              <MetricCard label={s.title} value={s.value as string} icon={s.icon} color={s.bg} />
            )}
          </Grid.Col>
        ))}
      </Grid>

      {/* ─── Financial Metrics ─── */}
      <Group grow>
        {isLoadingRevenue ? (
          <Skeleton height={120} radius="lg" />
        ) : (
          <MetricCard
            label="Total Revenue"
            value={`$${(totalRevenue ?? 0).toLocaleString()}`}
            icon={<IconCurrencyDollar size={22} />}
            color="teal"
          />
        )}
        {isLoadingAvgPrice ? (
          <Skeleton height={120} radius="lg" />
        ) : (
          <MetricCard
            label="Average Procedure Price"
            value={`$${(avgPrice ?? 0).toLocaleString()}`}
            icon={<IconCurrencyDollar size={22} />}
            color="green"
          />
        )}

      </Group>

      {/* ─── Donut Charts Row 1 ─── */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChartCard title="By Type" isLoading={isLoadingType} h={300}>
            <CustomDonutChart data={byType || []} />
          </ChartCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChartCard title="Payment Method" isLoading={isLoadingPayment} h={300}>
            <CustomDonutChart data={byPayment || []} />
          </ChartCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChartCard title="Status" isLoading={isLoadingStatus} h={300}>
            <CustomDonutChart data={byStatus || []} />
          </ChartCard>
        </Grid.Col>
      </Grid>

      {/* ─── Donut Charts Row 2 ─── */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <ChartCard title="Format" isLoading={isLoadingFormat} h={300}>
            <CustomDonutChart data={byFormat || []} />
          </ChartCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <ChartCard title="Priority" isLoading={isLoadingPriority} h={300}>
            <CustomDonutChart data={byPriority || []} />
          </ChartCard>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
