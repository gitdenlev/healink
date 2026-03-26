import { Group, Paper, Text, Box } from "@mantine/core";
import { StatsCardProps } from "./StatsCard.types";
import { cloneElement, isValidElement } from "react";

export function StatsCard({ title, value, icon, bg }: StatsCardProps) {
  return (
    <Paper  
      p="lg" 
      radius="lg" 
      shadow="xs" 
      bg={bg} 
      c="white" 
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Background Icon */}
      {isValidElement(icon) && (
        <Box
          style={{
            position: 'absolute',
            right: -10,
            top: "50%",
            transform: "translateY(-50%)",
            opacity: 0.15,
            pointerEvents: 'none',
          }}
        >
          {cloneElement(icon, { size: 100 } as any)}
        </Box>
      )}

      {/* Content */}
      <Box style={{ position: 'relative', zIndex: 1 }}>
        <Group justify="space-between" align="center" mb={4}>
          <Text c="white" fw={500} fz="sm">
            {title}
          </Text>
        </Group>

        <Group justify="space-between" align="baseline" mt={8}>
          <Text component="div" fw={700} fz={28} lh={1}>
            {value}
          </Text>
        </Group>
      </Box>
    </Paper>
  );
}
