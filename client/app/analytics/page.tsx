"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AnalyticsPage() {
  const router = useRouter();
  const { isLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAdmin ? "/analytics/patients" : "/patients");
    }
  }, [isAdmin, isLoading, router]);

  return null;
}
