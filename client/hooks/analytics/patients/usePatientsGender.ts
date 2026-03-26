import { useQuery } from "@tanstack/react-query";

export interface GenderRatio {
  male: number;
  female: number;
  total: number;
}

export function usePatientsGender() {
  return useQuery({
    queryKey: ["analytics", "patients", "gender"],
    queryFn: async (): Promise<GenderRatio> => {
      const res = await fetch("/api/analytics/patients/gender");
      if (!res.ok) throw new Error("Failed to fetch gender ratio");
      return res.json();
    },
  });
}
