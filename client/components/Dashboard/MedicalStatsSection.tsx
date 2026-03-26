import { Grid } from "@mantine/core";
import { ChartCard } from "./ChartCard";
import { CustomDonutChart } from "./CustomDonutChart";
import { CustomBarChart } from "./CustomBarChart";

export function MedicalStatsSection() {
  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <ChartCard title="За відділеннями">
          <CustomDonutChart 
            data={[
              { name: 'Терапія', value: 31, color: 'teal.4' },
              { name: 'Кардіологія', value: 23, color: 'teal.5' },
              { name: 'Стоматологія', value: 19, color: 'teal.6' },
              { name: 'Неврологія', value: 15, color: 'teal.7' },
              { name: 'Хірургія', value: 12, color: 'teal.8' },
            ]} 
          />
        </ChartCard>
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 4 }}>
        <ChartCard title="Навантаження лікарів">
          <CustomBarChart 
            horizontal
            color="cyan.5"
            data={[
              { name: 'Др. Петров О.', value: 90 },
              { name: 'Др. Шевченко Н.', value: 80 },
              { name: 'Др. Мельник В.', value: 70 },
              { name: 'Др. Коваль А.', value: 60 },
              { name: 'Др. Бойко Т.', value: 50 },
            ]} 
          />
        </ChartCard>
      </Grid.Col>
      
      <Grid.Col span={{ base: 12, md: 4 }}>
        <ChartCard title="Top Services">
          <CustomBarChart 
            data={[
              { name: 'Primary', value: 100 },
              { name: 'Ultrasound', value: 75 },
              { name: 'Blood test', value: 65 },
              { name: 'ECG', value: 45 },
              { name: 'X-ray', value: 35 },
            ]} 
          />
        </ChartCard>
      </Grid.Col>
    </Grid>
  );
}
