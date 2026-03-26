import { Grid, Stack, Skeleton } from "@mantine/core";
import { IconArchive, IconUsers, IconCalendar } from "@tabler/icons-react";
import { StatsCard } from "../StatsCard/StatsCard";
import { StatsCardSkeleton } from "../StatsCard/StatsCardSkeleton";
import { usePatientsTotal } from "@/hooks/patients/usePatientsTotal";
import { usePatientsStats } from "@/hooks/patients/usePatientsStats";
import { usePatientsAverageAge } from "@/hooks/patients/usePatientsAverageAge";
import { ChartCard } from "../Dashboard/ChartCard";
import { CustomDonutChart } from "../Dashboard/CustomDonutChart";
import { CustomBarChart } from "../Dashboard/CustomBarChart";
import { usePatientsGender } from "@/hooks/analytics/patients/usePatientsGender";
import { usePatientsTopCities } from "@/hooks/analytics/patients/usePatientsTopCities";
import { usePatientsAllergies } from "@/hooks/analytics/patients/usePatientsAllergies";
import { usePatientsDiseases } from "@/hooks/analytics/patients/usePatientsDiseases";
import { usePatientsAgeGroups } from "@/hooks/analytics/patients/usePatientsAgeGroups";

export function PatientsStatsSection() {
  const { data: genderData, isLoading: isLoadingGender } = usePatientsGender();
  const { data: topCitiesData, isLoading: isLoadingTopCities } =
    usePatientsTopCities();
  const { data: allergiesData, isLoading: isLoadingAllergies } =
    usePatientsAllergies();
  const { data: diseasesData, isLoading: isLoadingDiseases } =
    usePatientsDiseases();
  const { data: ageGroupsData, isLoading: isLoadingAgeGroups } =
    usePatientsAgeGroups();
  const { data: totalPatients, isLoading: isLoadingTotal } = usePatientsTotal();
  const { data: patientsStats, isLoading: isLoadingStats } = usePatientsStats();
  const { data: avgAge, isLoading: isLoadingAvgAge } = usePatientsAverageAge();

  const mainStats = [
    {
      title: "Total patients",
      value: totalPatients?.toLocaleString() || "0",
      icon: <IconUsers size={20} />,
      bg: "teal",
      loading: isLoadingTotal,
    },
    {
      title: "Active patients",
      value: patientsStats?.["Active"]?.toLocaleString() || "0",
      icon: <IconUsers size={20} />,
      bg: "green",
      loading: isLoadingStats,
    },
    {
      title: "Archived patients",
      value: patientsStats?.["Archived"]?.toLocaleString() || "0",
      icon: <IconArchive size={20} />,
      bg: "gray",
      loading: isLoadingStats,
    },
    {
      title: "Average age",
      value: `${avgAge || 0} years`,
      icon: <IconCalendar size={20} />,
      bg: "orange",
      loading: isLoadingAvgAge,
    },
  ];

  return (
    <Stack gap="xl">
      <Grid gutter="md">
        {mainStats.map((s) => (
          <Grid.Col key={s.title} span={{ base: 12, xs: 6, md: 3 }}>
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
                { name: "Male", value: genderData?.male ?? 0, color: "blue.6" },
                {
                  name: "Female",
                  value: genderData?.female ?? 0,
                  color: "pink.5",
                },
              ]}
            />
          </ChartCard>
        </Grid.Col>

        {/* Allergies */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChartCard title="Allergies" isLoading={isLoadingAllergies} h={300}>
            <CustomDonutChart data={allergiesData || []} />
          </ChartCard>
        </Grid.Col>

        {/* Diseases */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChartCard title="Diseases" isLoading={isLoadingDiseases} h={300}>
            <CustomDonutChart data={diseasesData || []} />
          </ChartCard>
        </Grid.Col>
      </Grid>

      <Grid gutter="md">
        {/* Age Groups */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <ChartCard title="Age Groups" isLoading={isLoadingAgeGroups} h={350}>
            <CustomBarChart color="teal.7" data={ageGroupsData || []} />
          </ChartCard>
        </Grid.Col>

        {/* Top Cities */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <ChartCard title="Top Cities" isLoading={isLoadingTopCities} h={350}>
            <CustomBarChart
              color="blue.5"
              horizontal
              data={topCitiesData || []}
            />
          </ChartCard>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
