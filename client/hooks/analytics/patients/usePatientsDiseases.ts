import { useQuery } from "@tanstack/react-query";

const COLORS = ["red.6", "blue.6", "teal.5", "orange.5", "cyan.4", "pink.4", "yellow.6"];

export function usePatientsDiseases() {
    return useQuery({
        queryKey: ["patients-diseases"],
        queryFn: async (): Promise<{ name: string; value: number; color: string }[]> => {
          const res = await fetch("/api/analytics/patients/diseases");
          if (!res.ok) throw new Error("Failed to fetch diseases");
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
