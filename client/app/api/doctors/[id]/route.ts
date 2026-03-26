import { NextResponse } from 'next/server';
import { UserRole } from '@/lib/auth-types';
import { handleRouteError, sendAuthorizedTcpMessage } from '@/lib/server-session';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const response = await sendAuthorizedTcpMessage(
      request,
      { cmd: 'delete_doctor' },
      { doctorId: id },
      [UserRole.ADMIN],
      'doctors',
    );

    return NextResponse.json(response);
  } catch (error) {
    return handleRouteError(error);
  }
}
