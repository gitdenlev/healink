'use client';

import { useMounted } from "@mantine/hooks";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar/Sidebar";

export function SidebarWrapper() {
  const mounted = useMounted();
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (!mounted || isLoading || !user || pathname === '/login') return null;
  
  return <Sidebar />;
}
