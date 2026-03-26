import { NextResponse } from 'next/server';
import { UserRole } from '@/lib/auth-types';
import { handleRouteError, sendAuthorizedTcpMessage } from '@/lib/server-session';

export async function GET(request: Request) {
  try {
    const response = await sendAuthorizedTcpMessage(
      request,
      { cmd: 'analytics.doctors.gender' },
      {},
      [UserRole.ADMIN],
      'analytics',
    );
    return NextResponse.json(response);
  } catch (error) {
    return handleRouteError(error);
  }
}
