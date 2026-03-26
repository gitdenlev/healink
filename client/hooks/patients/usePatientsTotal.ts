import { useQuery } from "@tanstack/react-query";

export function usePatientsTotal() {
  return useQuery({
    queryKey: ["patients", "total"],
    queryFn: async (): Promise<number> => {
      const res = await fetch("/api/patients/count");
      if (!res.ok) throw new Error("Failed to fetch patients total");
      const data = await res.json();
      return data.count;
    },
  });
}
