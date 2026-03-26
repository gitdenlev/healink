import { NextResponse } from 'next/server';
import { UserRole } from '@/lib/auth-types';
import { handleRouteError, sendAuthorizedTcpMessage } from '@/lib/server-session';

export const dynamic = 'force-dynamic'; // Роут завжди повинен виконувати запит на сервер, а не кешуватись

export async function GET(request: Request) {
  try {
    const response = await sendAuthorizedTcpMessage(
      request,
      { cmd: 'get_doctors_count' },
      {},
      [UserRole.ADMIN],
      'doctors',
    );
    
    return NextResponse.json({ count: response });
  } catch (error) {
    return handleRouteError(error);
  }
}
