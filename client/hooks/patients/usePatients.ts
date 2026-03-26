import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export interface Patient {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  initials: string;
  avatarUrl?: string;
  city: string;
  gender: string;
  dateOfBirth: string | Date;
  allergy?: string;
  disease?: string;
  contactNumber?: string;
  email?: string;
  lastVisit: string;
  status: "Active" | "Archived";
  createdAt: string | Date;
  assignedDoctorId: string | null;
}

interface PatientsResponse {
  items: Patient[];
  total: number;
}

const fetchPatients = async (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string | null;
}): Promise<PatientsResponse> => {
  const { page, limit, search, status } = params;
  const sp = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) sp.append("search", search);
  if (status) sp.append("status", status);

  const res = await fetch(`/api/patients?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
};

export function usePatients(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string | null;
}) {
  const { page, limit, search, status } = params;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actorScope = user ? `${user.role}:${user.id}` : "anonymous";

  const query = useQuery({
    queryKey: ["patients", "list", actorScope, page, limit, search, status],
    queryFn: () => fetchPatients(params),
    enabled: Boolean(user),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Prefetch next page
  useEffect(() => {
    if (user && query.data && page < Math.ceil(query.data.total / limit)) {
      const nextPage = page + 1;
      
      queryClient.prefetchQuery({
        queryKey: ["patients", "list", actorScope, nextPage, limit, search, status],
        queryFn: () =>
          fetchPatients({
            page: nextPage,
            limit,
            search,
            status,
          }),
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [page, limit, search, status, query.data, queryClient, user, actorScope]);

  return query;
}
