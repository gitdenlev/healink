import { useQuery } from "@tanstack/react-query";

export function useDoctorsTop() {
  return useQuery({
    queryKey: ["analytics", "doctors", "top"],
    queryFn: async (): Promise<{ name: string; value: number }[]> => {
      const res = await fetch("/api/analytics/doctors/top");
      if (!res.ok) throw new Error("Failed to fetch top doctors");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          name: item.name || "Unknown",
          value: Number(item.value || 0),
        }));
      }
      
      return [];
    },
  });
}
