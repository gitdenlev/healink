import classes from './StatsCardSkeleton.module.css';
import { Skeleton } from '@mantine/core';

export function StatsCardSkeleton() {
  return <Skeleton height={28} width={80} radius="md" />;
}
