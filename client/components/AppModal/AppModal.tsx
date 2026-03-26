"use client";

import { ReactNode } from "react";
import { ActionIcon, Box, Paper, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface AppModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: number | string;
}

export function AppModal({
  opened,
  onClose,
  title,
  children,
  size = 680,
}: AppModalProps) {
  if (!opened) {
    return null;
  }

  return (
    <Box
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <Paper
        radius="lg"
        shadow="xl"
        p="lg"
        w="100%"
        maw={size}
        style={{
          maxHeight: "min(90vh, 860px)",
          overflowY: "auto",
          backgroundColor: "white",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <Box
          mb="md"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text fw={700} fz="lg" c="dark.7">
            {title}
          </Text>
          <ActionIcon variant="subtle" color="gray" onClick={onClose}>
            <IconX size={18} />
          </ActionIcon>
        </Box>
        {children}
      </Paper>
    </Box>
  );
}
