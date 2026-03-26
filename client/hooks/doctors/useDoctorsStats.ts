import { useQuery } from "@tanstack/react-query";

interface DoctorStatsResponse {
  status: string;
  count: string;
}

export function useDoctorsStats() {
  return useQuery({
    queryKey: ["doctors", "stats"],
    queryFn: async (): Promise<Record<string, number>> => {
      const res = await fetch("/api/doctors/stats");
      if (!res.ok) throw new Error("Failed to fetch doctors stats");
      const data = await res.json();
      
      const map: Record<string, number> = {
        "On duty": 0,
        "On leave": 0,
        "Medical leave": 0,
        "Off duty": 0,
      };
      
      if (data.stats && Array.isArray(data.stats)) {
        data.stats.forEach((item: DoctorStatsResponse) => {
          if (item.status) {
            map[item.status] = Number(item.count);
          }
        });
      }
      return map;
    },
  });
}
