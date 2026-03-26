import { Paper, Title, Box, Skeleton } from "@mantine/core";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  h?: number | string;
  isLoading?: boolean;
}

export function ChartCard({ title, children, h = 300, isLoading }: ChartCardProps) {
  if (isLoading) {
    return <Skeleton height={h} radius="lg" />;
  }

  return (
    <Paper p="lg" bg="gray.0" withBorder radius="lg" style={{ height: h, display: 'flex', flexDirection: 'column' }}>
      <Title order={4} mb="md" fw={600} size="xs" c="gray.6" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </Title>
      <Box style={{ flex: 1, minHeight: 0 }}>
        {children}
      </Box>
    </Paper>
  );
}
