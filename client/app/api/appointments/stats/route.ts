import { NextResponse } from 'next/server';
import { UserRole } from '@/lib/auth-types';
import { handleRouteError, sendAuthorizedTcpMessage } from '@/lib/server-session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const response = await sendAuthorizedTcpMessage(
      request,
      { cmd: 'get_appointments_stats' },
      {},
      [UserRole.ADMIN],
      'appointments',
    );
    
    return NextResponse.json({ stats: response });
  } catch (error) {
    return handleRouteError(error);
  }
}
