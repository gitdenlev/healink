import { QueryClient } from "@tanstack/react-query";

const CORE_QUERY_KEYS = [
  ["doctors"],
  ["patients"],
  ["appointments"],
] as const;

export async function refreshCoreClinicData(queryClient: QueryClient) {
  await Promise.all(
    CORE_QUERY_KEYS.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    )
  );

  await Promise.all(
    CORE_QUERY_KEYS.map((queryKey) =>
      queryClient.refetchQueries({ queryKey, type: "active" })
    )
  );
}
