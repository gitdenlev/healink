"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "@/context/AuthContext";

export function AdminOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/patients");
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading || !isAdmin) {
    return (
      <Center mih="100vh">
        <Loader color="teal" />
      </Center>
    );
  }

  return <>{children}</>;
}
