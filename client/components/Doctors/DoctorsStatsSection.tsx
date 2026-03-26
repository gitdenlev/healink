import { Grid, Stack, Skeleton } from "@mantine/core";
import {
  IconStethoscope,
  IconBeach,
  IconFirstAidKit,
  IconBriefcase2,
  IconMoodHappy
} from "@tabler/icons-react";
import { StatsCard } from "../StatsCard/StatsCard";
import { StatsCardSkeleton } from "../StatsCard/StatsCardSkeleton";
import { useDoctorsTotal } from "@/hooks/doctors/useDoctors";
import { useDoctorsStats } from "@/hooks/doctors/useDoctorsStats";
import { ChartCard } from "../Dashboard/ChartCard";
import { CustomDonutChart } from "../Dashboard/CustomDonutChart";
import { CustomBarChart } from "../Dashboard/CustomBarChart";
import { useDoctorsGender } from "@/hooks/analytics/doctors/useDoctorsGender";
import { useDoctorsExperience } from "@/hooks/analytics/doctors/useDoctorsExperience";
import { useDoctorsDepartment } from "@/hooks/analytics/doctors/useDoctorsDepartment";
import { useDoctorsTop } from "@/hooks/analytics/doctors/useDoctorsTop";

export function DoctorsStatsSection() {
  const { data: genderData, isLoading: isLoadingGender } = useDoctorsGender();
  const { data: experienceData, isLoading: isLoadingExperience } = useDoctorsExperience();
  const { data: departmentData, isLoading: isLoadingDepartment } = useDoctorsDepartment();
  const { data: topDoctorsData, isLoading: isLoadingTop } = useDoctorsTop();
  const { data: totalDoctors, isLoading: isLoadingTotal } = useDoctorsTotal();
  const { data: statusStats, isLoading: isLoadingStats } = useDoctorsStats();

  const getStatusValue = (status: "On duty" | "On leave" | "Medical leave" | "Off duty") => {
    if (isLoadingStats) return <StatsCardSkeleton />;
    return statusStats?.[status]?.toLocaleString() || "0";
  };

  const mainStats = [
    { title: "Total doctors", value: totalDoctors?.toLocaleString() || "0", icon: <IconStethoscope size={20} />, bg: "teal", loading: isLoadingTotal },
    { title: "On duty", value: statusStats?.["On duty"]?.toLocaleString() || "0", icon: <IconBriefcase2 size={20} />, bg: "blue", loading: isLoadingStats },
    { title: "On leave", value: statusStats?.["On leave"]?.toLocaleString() || "0", icon: <IconBeach size={20} />, bg: "orange", loading: isLoadingStats },
    { title: "Medical leave", value: statusStats?.["Medical leave"]?.toLocaleString() || "0", icon: <IconFirstAidKit size={20} />, bg: "red", loading: isLoadingStats },
    { title: "Off duty", value: statusStats?.["Off duty"]?.toLocaleString() || "0", icon: <IconMoodHappy size={20} />, bg: "gray", loading: isLoadingStats },
  ];

  return (
    <Stack gap="xl">
      <Grid gutter="md">
        {mainStats.map((s) => (
          <Grid.Col key={s.title} span={{ base: 12, xs: 6, md: 3, lg: 2.4 }}>
            {s.loading ? (
              <Skeleton height={120} radius="lg" />
            ) : (
              <StatsCard {...s} />
            )}
          </Grid.Col>
        ))}
      </Grid>
      <Grid gutter="md">
        {/* Gender Distribution */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChartCard title="Gender" isLoading={isLoadingGender} h={300}>
            <CustomDonutChart
              data={[
                { name: "Male", value: genderData?.male ?? 0, color: "blue.5" },
                { name: "Female", value: genderData?.female ?? 0, color: "pink.4" },
              ]}
            />
          </ChartCard>
        </Grid.Col>

        {/* Experience Groups */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChartCard title="Experience" isLoading={isLoadingExperience} h={300}>
            <CustomDonutChart data={experienceData || []} />
          </ChartCard>
        </Grid.Col>

        {/* Departments */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChartCard title="Department" isLoading={isLoadingDepartment} h={300}>
            <CustomDonutChart data={departmentData || []} />
          </ChartCard>
        </Grid.Col>
      </Grid>

      <Grid gutter="md">
        {/* Top Doctors */}
        <Grid.Col span={12}>
          <ChartCard title="Top Doctors by Patient Load" isLoading={isLoadingTop} h={350}>
            <CustomBarChart
              color="teal.6"
              data={topDoctorsData || []}
            />
          </ChartCard>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
