import { ReactNode } from "react";

export interface StatsCardProps {
  title: string;
  value: string | number | ReactNode;
  icon: React.ReactNode;
  bg: string;
}
