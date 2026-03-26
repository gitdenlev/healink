import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useDoctorsTotal() {
  return useQuery({
    queryKey: ["doctors", "total"],
    queryFn: async (): Promise<number> => {
      const res = await fetch("/api/doctors/count");
      if (!res.ok) throw new Error("Failed to fetch doctors count");
      const data = await res.json();
      return data.count;
    },
  });
}

export interface Doctor {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  initials: string;
  department: string;
  specialty: string;
  avatarUrl?: string | null;
  patients: number;
  status: "On duty" | "On leave" | "Medical leave" | "Off duty";
}

interface DoctorsResponse {
  items: Doctor[];
  total: number;
}

const fetchDoctors = async (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string | null;
}): Promise<DoctorsResponse> => {
  const { page, limit, search, status } = params;
  const sp = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) sp.append("search", search);
  if (status) sp.append("status", status);

  const res = await fetch(`/api/doctors?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch doctors");
  return res.json();
};

export function useDoctors(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string | null;
}) {
  const { page, limit, search, status } = params;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["doctors", "list", page, limit, search, status],
    queryFn: () => fetchDoctors(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Prefetch next page
  useEffect(() => {
    if (query.data && page < Math.ceil(query.data.total / limit)) {
      const nextPage = page + 1;
      const nextParams = { ...params, page: nextPage };
      
      queryClient.prefetchQuery({
        queryKey: ["doctors", "list", nextPage, limit, search, status],
        queryFn: async () => {
          const data = await fetchDoctors(nextParams);
          // Preload images for the next page
          data.items.forEach(doctor => {
            if (doctor.avatarUrl) {
              const img = new Image();
              img.src = doctor.avatarUrl;
            }
          });
          return data;
        },
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [page, limit, search, status, query.data, queryClient]);

  return query;
}
