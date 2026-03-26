import { NextResponse } from 'next/server';
import { UserRole } from '@/lib/auth-types';
import { handleRouteError, sendAuthorizedTcpMessage } from '@/lib/server-session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page   = parseInt(searchParams.get('page')   || '1');
  const limit  = parseInt(searchParams.get('limit')  || '100');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  try {
    const response = await sendAuthorizedTcpMessage(
      request,
      { cmd: 'get_appointments_paginated' },
      { page, limit, search, status },
      [UserRole.ADMIN, UserRole.DOCTOR],
      'appointments',
    );
    return NextResponse.json(response);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    const appointment = await request.json();
    const response = await sendAuthorizedTcpMessage(
      request,
      { cmd: 'create_appointment' },
      { appointment },
      [UserRole.DOCTOR],
      'appointments',
    );

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
