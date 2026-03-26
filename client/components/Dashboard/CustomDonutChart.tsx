import { Text, Group, Stack, Box } from "@mantine/core";
import { useState } from "react";

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface CustomDonutChartProps {
  data: ChartData[];
  size?: number;
}

export function CustomDonutChart({ data, size = 160 }: CustomDonutChartProps) {
  const [activeSlice, setActiveSlice] = useState<number | null>(null);
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  const margin = 15;
  const chartSize = size - (margin * 2);
  const radius = chartSize / 2;
  const center = size / 2;
  const donutThickness = 34;
  const innerRadius = radius - donutThickness;

  const slices = data.reduce<{
    currentAngle: number;
    items: Array<ChartData & { pathData: string; percentage: number; tooltip: string }>;
  }>(
    (acc, item) => {
      const angle = total > 0 ? (item.value / total) * 360 : 0;
      const startAngle = acc.currentAngle;
      const endAngle = startAngle + angle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const ox1 = center + radius * Math.cos(startRad);
      const oy1 = center + radius * Math.sin(startRad);
      const ox2 = center + radius * Math.cos(endRad);
      const oy2 = center + radius * Math.sin(endRad);

      const ix1 = center + innerRadius * Math.cos(endRad);
      const iy1 = center + innerRadius * Math.sin(endRad);
      const ix2 = center + innerRadius * Math.cos(startRad);
      const iy2 = center + innerRadius * Math.sin(startRad);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

      const pathData = `
      M ${ox1},${oy1}
      A ${radius},${radius} 0 ${largeArcFlag},1 ${ox2},${oy2}
      L ${ix1},${iy1}
      A ${innerRadius},${innerRadius} 0 ${largeArcFlag},0 ${ix2},${iy2}
      Z
    `;

      acc.items.push({
        ...item,
        pathData,
        percentage,
        tooltip: `${item.name}: ${percentage}%`,
      });
      acc.currentAngle = endAngle;
      return acc;
    },
    { currentAngle: -90, items: [] },
  ).items;

  const getMantineColor = (colorStr: string) => {
    const parts = colorStr.split('.');
    if (parts.length === 2) return `var(--mantine-color-${parts[0]}-${parts[1]})`;
    return `var(--mantine-color-${colorStr}-6)`;
  };

  return (
    <Stack align="center" gap="xs" style={{ position: 'relative' }} h="100%" justify="center">
      <Box style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
          <g>
            {slices.map((slice, i) => (
              <path
                key={i}
                d={slice.pathData}
                fill={getMantineColor(slice.color)}
                style={{ 
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transformOrigin: `${center}px ${center}px`,
                  transform: activeSlice === i ? 'scale(1.08)' : 'scale(1)',
                  opacity: activeSlice !== null && activeSlice !== i ? 0.4 : 1,
                  cursor: 'pointer',
                  stroke: 'white',
                  strokeWidth: 1,
                  vectorEffect: 'non-scaling-stroke'
                }}
                onMouseEnter={() => setActiveSlice(i)}
                onMouseLeave={() => setActiveSlice(null)}
              >
                <title>{slice.tooltip}</title>
              </path>
            ))}
          </g>
        </svg>
        
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: innerRadius * 2,
            zIndex: 5
          }}
        >
          <Text fw={800} size="sm" style={{ lineHeight: 1, color: '#2C2E33' }}>
            {slices.length > 0 
              ? (activeSlice !== null ? slices[activeSlice].percentage : slices[0].percentage) 
              : 0}%
          </Text>
        </Box>
      </Box>

      <Group gap="xs" justify="center" mt="md">
        {data.map((item, i) => (
          <Group 
            key={item.name} 
            gap={6} 
            style={{ 
              cursor: 'pointer',
              opacity: activeSlice !== null && activeSlice !== i ? 0.4 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={() => setActiveSlice(i)}
            onMouseLeave={() => setActiveSlice(null)}
          >
            <Box bg={item.color} style={{ width: 10, height: 10, borderRadius: '50%' }} />
            <Text size="xs" c="dimmed" fw={activeSlice === i ? 600 : 400}>{item.name}</Text>
          </Group>
        ))}
      </Group>
    </Stack>
  );
}
