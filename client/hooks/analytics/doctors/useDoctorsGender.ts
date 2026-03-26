import { useQuery } from "@tanstack/react-query";

export function useDoctorsGender() {
  return useQuery({
    queryKey: ["analytics", "doctors", "gender"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/doctors/gender");
      if (!res.ok) throw new Error("Failed to fetch gender ratio");
      const data = await res.json();
      return data;
    },
  });
}
