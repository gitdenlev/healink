import { Grid, Stack } from "@mantine/core";
import { ChartCard } from "./ChartCard";
import { CustomDonutChart } from "./CustomDonutChart";
import { CustomBarChart } from "./CustomBarChart";

export function BusinessOverviewSection() {
  return (
    <Stack gap="xl">
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChartCard title="Visit Status">
            <CustomDonutChart
              data={[
                { name: "Completed", value: 79, color: "teal.6" },
                { name: "Cancelled", value: 12, color: "orange.6" },
                { name: "No Show", value: 8, color: "red.6" },
              ]}
            />
          </ChartCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChartCard title="Client Type">
            <CustomDonutChart
              data={[
                { name: "Regular", value: 66, color: "teal.6" },
                { name: "New", value: 34, color: "cyan.4" },
              ]}  
            />
          </ChartCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <ChartCard title="Payment Type">
            <CustomDonutChart
              data={[
                { name: "Card", value: 45, color: "blue.5" },
                { name: "Cash", value: 27, color: "teal.6" },
                { name: "Insurance", value: 28, color: "cyan.5" },
              ]}
            />
          </ChartCard>
        </Grid.Col>
      </Grid>

      {/* Row: Bar Charts (Volume/Comparison) */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <ChartCard title="Source of Booking">
            <CustomBarChart
              color="teal.8"
              horizontal
              data={[
                { name: "Website", value: 70 },
                { name: "Call", value: 55 },
                { name: "Reception", value: 40 },
              ]}
            />
          </ChartCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <ChartCard title="Top Services">
            <CustomBarChart
              data={[
                { name: "Primary", value: 100 },
                { name: "Ultrasound", value: 75 },
                { name: "Blood test", value: 65 },
                { name: "ECG", value: 45 },
                { name: "X-ray", value: 35 },
              ]}
            />
          </ChartCard>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
