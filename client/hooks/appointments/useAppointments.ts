import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export interface AppointmentItem {
  id: string;
  patient: string;
  patientId: string | null;
  patientInitials: string;
  patientAvatarUrl: string | null;
  doctor: string;
  doctorId: string | null;
  doctorInitials: string;
  doctorSpecialty: string;
  doctorAvatarUrl: string | null;
  service: string;
  date: string;
  duration: number;
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled";
  paymentMethod: "Card" | "Insurance" | "Cash";
  format: "In-person" | "Online";
  priority: "Routine" | "Urgent";
  price: number;
}

interface AppointmentsResponse {
  items: AppointmentItem[];
  total: number;
}

const fetchAppointments = async (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string | null;
}): Promise<AppointmentsResponse> => {
  const { page, limit, search, status } = params;
  const sp = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) sp.append("search", search);
  if (status) sp.append("status", status);

  const res = await fetch(`/api/appointments?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch appointments");
  return res.json();
};

export function useAppointments(params: {
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
    queryKey: ["appointments", "list", actorScope, page, limit, search, status],
    queryFn: () => fetchAppointments(params),
    enabled: Boolean(user),
    staleTime: 1000 * 60 * 5,
  });

  // Prefetch next page
  useEffect(() => {
    if (user && query.data && page < Math.ceil(query.data.total / limit)) {
      const nextPage = page + 1;
      queryClient.prefetchQuery({
        queryKey: [
          "appointments",
          "list",
          actorScope,
          nextPage,
          limit,
          search,
          status,
        ],
        queryFn: () =>
          fetchAppointments({
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
