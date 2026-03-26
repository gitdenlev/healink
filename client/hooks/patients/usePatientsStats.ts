import { useQuery } from "@tanstack/react-query";

export interface PatientStat {
  status: string;
  count: string | number;
}

export function usePatientsStats() {
  return useQuery({
    queryKey: ["patients", "stats"],
    queryFn: async (): Promise<Record<string, number>> => {
      const res = await fetch("/api/patients/stats");
      if (!res.ok) throw new Error("Failed to fetch patients stats");
      const data = await res.json();
      
      const statsMap: Record<string, number> = {
        Active: 0,
        Archived: 0,
      };

      if (data.stats && Array.isArray(data.stats)) {
        data.stats.forEach((stat: PatientStat) => {
          if (stat.status) {
            statsMap[stat.status] = Number(stat.count);
          }
        });
      }

      return statsMap;
    },
  });
}
