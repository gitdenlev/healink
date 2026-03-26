"use client";

import { useEffect } from "react";
import { Container, Stack, Text, Title } from "@mantine/core";
import { AppointmentsStatsSection } from "@/components/Appointments/AppointmentsStatsSection";
import { AdminOnly } from "@/components/Auth/AdminOnly";
import { event } from "@/lib/gtag";

export default function AppointmentsAnalyticsPage() {
  useEffect(() => {
    event({
      action: "view_analytics",
      category: "Analytics",
      label: "Appointments Analytics",
    });
  }, []);

  return (
    <AdminOnly>
      <Container fluid p="md" bg="gray.0">
        <Stack gap="xl">
          <div>
            <Title order={2} fw={700} c="dark.4">Appointments Analytics</Title>
            <Text fz="sm" c="dimmed">Insights on appointment trends and scheduling patterns</Text>
          </div>
          <AppointmentsStatsSection />
        </Stack>
      </Container>
    </AdminOnly>
  );
}
