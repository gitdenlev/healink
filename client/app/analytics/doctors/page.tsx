"use client";

import { useEffect } from "react";
import { Container, Stack, Text, Title } from "@mantine/core";
import { DoctorsStatsSection } from "@/components/Doctors/DoctorsStatsSection";
import { AdminOnly } from "@/components/Auth/AdminOnly";
import { event } from "@/lib/gtag";

export default function DoctorAnalyticsPage() {
  useEffect(() => {
    event({
      action: "view_analytics",
      category: "Analytics",
      label: "Doctors Analytics",
    });
  }, []);

  return (
    <AdminOnly>
      <Container fluid p="md" bg="gray.0">
        <Stack gap="xl">
          <div>
            <Title order={2} fw={700} c="dark.4">Doctors Analytics</Title>
            <Text fz="sm" c="dimmed">Insights on doctor performance, departments and experience</Text>
          </div>
          <DoctorsStatsSection />
        </Stack>
      </Container>
    </AdminOnly>
  );
}
