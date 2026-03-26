import { useQuery } from "@tanstack/react-query";

const COLORS = ["teal.3", "blue.4", "indigo.6"];

export function useDoctorsExperience() {
  return useQuery({
    queryKey: ["analytics", "doctors", "experience"],
    queryFn: async (): Promise<{ name: string; value: number; color: string }[]> => {
      const res = await fetch("/api/analytics/doctors/experience");
      if (!res.ok) throw new Error("Failed to fetch experience distribution");
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
