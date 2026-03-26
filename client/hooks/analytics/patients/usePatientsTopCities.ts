import { useQuery } from "@tanstack/react-query";

export interface CityStat {
  city: string;
  count: string | number;
}

export function usePatientsTopCities() {
  return useQuery({
    queryKey: ["analytics", "patients", "top-cities"],
    queryFn: async (): Promise<{ name: string; value: number }[]> => {
      const res = await fetch("/api/analytics/patients/top-cities");
      if (!res.ok) throw new Error("Failed to fetch top cities");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        return data.map((item: CityStat) => ({
          name: item.city || "Unknown",
          value: Number(item.count || 0),
        }));
      }
      
      return [];
    },
  });
}
