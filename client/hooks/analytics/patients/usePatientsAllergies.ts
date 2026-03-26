import { useQuery } from "@tanstack/react-query";

export interface AllergyStat {
  allergy: string;
  count: string | number;
}

const COLORS = ["teal.6", "orange.6", "red.6", "cyan.4", "blue.3", "pink.4", "violet.5"];

export function usePatientsAllergies() {
  return useQuery({
    queryKey: ["analytics", "patients", "allergies"],
    queryFn: async (): Promise<{ name: string; value: number; color: string }[]> => {
      const res = await fetch("/api/analytics/patients/allergies");
      if (!res.ok) throw new Error("Failed to fetch allergies");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        return data.map((item: any, index: number) => ({
          name: item.name || "Unknown",
          value: Number(item.value || 0),
          color: COLORS[index % COLORS.length]
        }));
      }
      
      return [];
    },
  });
}
