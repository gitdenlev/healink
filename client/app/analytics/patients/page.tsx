"use client";

import { useEffect } from "react";
import { Container, Stack, Text, Title } from "@mantine/core";
import { PatientsStatsSection } from "@/components/Patients/PatientsStatsSection";
import { AdminOnly } from "@/components/Auth/AdminOnly";
import { event } from "@/lib/gtag";

export default function PatientAnalyticsPage() {
  useEffect(() => {
    event({
      action: "view_analytics",
      category: "Analytics",
      label: "Patients Analytics",
    });
  }, []);

  return (
    <AdminOnly>
      <Container fluid p="md" bg="gray.0">
        <Stack gap="xl">
          <div>
            <Title order={2} fw={700} c="dark.4">Patients Analytics</Title>
            <Text fz="sm" c="dimmed">Insights on patient demographics and health data</Text>
          </div>
          <PatientsStatsSection />
        </Stack>
      </Container>
    </AdminOnly>
  );
}
