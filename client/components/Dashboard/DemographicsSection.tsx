import { Grid } from "@mantine/core";
import { ChartCard } from "./ChartCard";
import { CustomDonutChart } from "./CustomDonutChart";
import { CustomBarChart } from "./CustomBarChart";

export function DemographicsSection() {
  return (
    <Grid gutter="md" mt="md">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <ChartCard title="Гендерний розподіл">
          <CustomDonutChart 
            data={[
              { name: 'Жінки', value: 58, color: 'pink.6' },
              { name: 'Чоловіки', value: 42, color: 'blue.6' },
            ]} 
          />
        </ChartCard>
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 4 }}>
        <ChartCard title="Вікові групи">
          <CustomBarChart 
            data={[
              { name: '0-18', value: 30 },
              { name: '18-35', value: 75 },
              { name: '35-50', value: 90 },
              { name: '50+', value: 60 },
            ]} 
          />
        </ChartCard>
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 4 }}>
        <ChartCard title="Географія (райони)">
          <CustomBarChart 
            horizontal
            data={[
              { name: 'Центр', value: 95 },
              { name: 'Шевченківський', value: 80 },
              { name: 'Подільський', value: 70 },
              { name: 'Печерський', value: 60 },
              { name: 'Оболонський', value: 65 },
            ]} 
          />
        </ChartCard>
      </Grid.Col>
    </Grid>
  );
}
