import { NextResponse } from 'next/server';
import { UserRole } from '@/lib/auth-types';
import { handleRouteError, sendAuthorizedTcpMessage } from '@/lib/server-session';

export async function GET(request: Request) {
  try {
    const res = await sendAuthorizedTcpMessage(
      request,
      { cmd: 'analytics.appointments.avg_duration' },
      {},
      [UserRole.ADMIN],
      'analytics',
    );
    return NextResponse.json(res);
  } catch (e) {
    return handleRouteError(e);
  }
}
