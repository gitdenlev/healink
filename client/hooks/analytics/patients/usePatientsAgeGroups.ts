import { useQuery } from "@tanstack/react-query";

export function usePatientsAgeGroups() {
  return useQuery({
    queryKey: ["analytics", "patients", "age-groups"],
    queryFn: async (): Promise<{ name: string; value: number }[]> => {
      const res = await fetch("/api/analytics/patients/age-groups");
      if (!res.ok) throw new Error("Failed to fetch age groups");
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
