import { useQuery } from "@tanstack/react-query";

const COLORS = ["indigo.4", "cyan.5", "teal.6", "blue.6", "violet.4"];

export function useDoctorsDepartment() {
  return useQuery({
    queryKey: ["analytics", "doctors", "department"],
    queryFn: async (): Promise<{ name: string; value: number; color: string }[]> => {
      const res = await fetch("/api/analytics/doctors/department");
      if (!res.ok) throw new Error("Failed to fetch department distribution");
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
