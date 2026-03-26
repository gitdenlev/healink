import { Grid } from "@mantine/core";
import { ChartCard } from "./ChartCard";
import { CustomDonutChart } from "./CustomDonutChart";
import { CustomBarChart } from "./CustomBarChart";

export function BusinessActivitySection() {
  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, md: 3 }}>
        <ChartCard title="Visit Status">
          <CustomDonutChart
            data={[
              { name: "Completed", value: 80, color: "teal.6" },
              { name: "Cancelled", value: 12, color: "orange.6" },
              { name: "No Show", value: 8, color: "red.6" },
            ]}
          />
        </ChartCard>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 3 }}>
        <ChartCard title="Client Type">
          <CustomDonutChart
            data={[
              { name: "Regular", value: 66, color: "teal.6" },
              { name: "New", value: 34, color: "cyan.4" },
            ]}
          />
        </ChartCard>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 3 }}>
        <ChartCard title="Booking Source">
          <CustomBarChart
            color="teal.8"
            data={[
              { name: "Website", value: 70 },
              { name: "Phone", value: 55 },
              { name: "Reception", value: 40 },
            ]}
          />
        </ChartCard>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 3 }}>
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
  );
}
