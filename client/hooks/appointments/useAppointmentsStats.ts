import { useQuery } from "@tanstack/react-query";

interface AppointmentStatItem {
  status: string;
  count: string | number;
}

export function useAppointmentsStats() {
  return useQuery({
    queryKey: ["appointments", "stats"],
    queryFn: async (): Promise<Record<string, number>> => {
      const res = await fetch("/api/appointments/stats");
      if (!res.ok) throw new Error("Failed to fetch appointments stats");
      const data = await res.json();
      
      const map: Record<string, number> = {
        completed: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
      };
      
      if (data.stats && Array.isArray(data.stats)) {
        data.stats.forEach((item: AppointmentStatItem) => {
          const status = item.status.toLowerCase();
          if (status in map) {
            map[status] = Number(item.count);
          }
        });
      }
      
      return map;
    },
  });
}
