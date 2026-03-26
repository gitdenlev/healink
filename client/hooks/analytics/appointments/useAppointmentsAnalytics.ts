import { useQuery } from "@tanstack/react-query";

type ChartItem = { name: string; value: number; color: string };

const PALETTES: Record<string, string[]> = {
  type: ["teal.6", "blue.5", "violet.5", "cyan.4", "indigo.4", "pink.4"],
  paymentMethod: ["green.5", "blue.5", "orange.5"],
  status: ["blue.5", "green.5", "orange.5", "red.5"],
  format: ["teal.5", "violet.5"],
  priority: ["teal.5", "red.5"],
};

function makeHook(url: string, palette: string[]) {
  return () =>
    useQuery({
      queryKey: ["analytics", "appointments", url],
      queryFn: async (): Promise<ChartItem[]> => {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map((item: any, i: number) => ({
            name: item.name || "Unknown",
            value: Number(item.value || 0),
            color: palette[i % palette.length],
          }));
        }
        return [];
      },
    });
}

export const useAppointmentsByType = makeHook(
  "/api/analytics/appointments/by-type",
  PALETTES.type
);

export const useAppointmentsByPaymentMethod = makeHook(
  "/api/analytics/appointments/by-payment-method",
  PALETTES.paymentMethod
);

export const useAppointmentsByStatus = makeHook(
  "/api/analytics/appointments/by-status",
  PALETTES.status
);

export const useAppointmentsByFormat = makeHook(
  "/api/analytics/appointments/by-format",
  PALETTES.format
);

export const useAppointmentsByPriority = makeHook(
  "/api/analytics/appointments/by-priority",
  PALETTES.priority
);

export function useAppointmentsAvgPrice() {
  return useQuery({
    queryKey: ["analytics", "appointments", "avg-price"],
    queryFn: async (): Promise<number> => {
      const res = await fetch("/api/analytics/appointments/avg-price");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data?.avgPrice ?? 0;
    },
  });
}

export function useAppointmentsTotalRevenue() {
  return useQuery({
    queryKey: ["analytics", "appointments", "total-revenue"],
    queryFn: async (): Promise<number> => {
      const res = await fetch("/api/analytics/appointments/total-revenue");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data?.totalRevenue ?? 0;
    },
  });
}

export function useAppointmentsAvgDuration() {
  return useQuery({
    queryKey: ["analytics", "appointments", "avg-duration"],
    queryFn: async (): Promise<number> => {
      const res = await fetch("/api/analytics/appointments/avg-duration");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data?.avgDuration ?? 0;
    },
  });
}
