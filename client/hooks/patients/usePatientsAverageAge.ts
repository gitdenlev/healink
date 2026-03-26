import { useQuery } from "@tanstack/react-query";

export const usePatientsAverageAge = () => {
  return useQuery({
    queryKey: ["patients-avg-age"],
    queryFn: async (): Promise<number> => {
      const res = await fetch("/api/patients/avg-age");
      if (!res.ok) throw new Error("Failed to fetch avg age");
      const data = await res.json();
      
      const rawValue = data?.avgAge?.averageAge;
      return rawValue ? Math.round(Number(rawValue)) : 0;
    },
  });
};
