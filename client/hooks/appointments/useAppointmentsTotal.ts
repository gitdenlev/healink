import { useQuery } from "@tanstack/react-query";

export function useAppointmentsTotal() {
    return useQuery({
        queryKey: ["appointments", "total"],
        queryFn: async (): Promise<number> => {
            const res = await fetch("/api/appointments/count");
            if (!res.ok) throw new Error("Failed to fetch appointments count");
            const data = await res.json();
            return data.count;
        },
    });
}
