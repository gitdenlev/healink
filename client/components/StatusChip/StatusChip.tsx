"use client";

import { Chip, Box, rem } from "@mantine/core";
import { ReactNode } from "react";

export interface StatusChipProps {
  label: string;
  color: string;
  icon?: ReactNode;
}

export function StatusChip({ label, color, icon }: StatusChipProps) {
  return (
    <Box style={{ pointerEvents: "none" }}>
      <Chip
        checked
        color={color}
        variant="filled"
        radius="xl"
        size="sm"
        icon={icon}
      >
        {label}
      </Chip>
    </Box>
  );
}
