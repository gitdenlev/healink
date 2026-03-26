"use client";

import { Box, Group, Paper, PaperProps, Text } from "@mantine/core";

import { ReactNode } from "react";

type AlertTone = "error" | "warning" | "success" | "info";

const toneMap: Record<
  AlertTone,
  {
    background: string;
    border: string;
    title: string;
    text: string;
  }
> = {
  error: {
    background: "#fff2f2",
    border: "#ffd8d8",
    title: "#8c2d2d",
    text: "#7a2b2b",
  },
  warning: {
    background: "#fff9db",
    border: "#ffec99",
    title: "#7a5a17",
    text: "#6b4f13",
  },
  success: {
    background: "#ebfbee",
    border: "#c3e6cb",
    title: "#2b6b3f",
    text: "#285c38",
  },
  info: {
    background: "#edf6ff",
    border: "#d0ebff",
    title: "#1c4c7e",
    text: "#204a74",
  },
};

export interface AlertProps extends Omit<PaperProps, "children"> {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
}

export function Alert({
  tone = "info",
  title,
  children,
  ...paperProps
}: AlertProps) {
  const colors = toneMap[tone];

  return (
    <Paper
      withBorder
      radius="xl"
      px="sm"
      py={5}
      {...paperProps}
      style={{
        borderColor: colors.border,
        backgroundColor: colors.background,
        ...paperProps.style,
        width: "100%",
      }}
    >
      <Group gap="xs" p={3}>
        <Box>
          {title && (
            <Text fw={600} fz="sm" c={colors.title}>
              {title}
            </Text>
          )}
          <Text fz="sm" c={colors.text}>
            {children}
          </Text>
        </Box>
      </Group>
    </Paper>
  );
}
