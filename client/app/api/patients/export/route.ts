import { UserRole } from '@/lib/auth-types';
import {
  handleRouteError,
  sendAuthorizedTcpMessage,
  serializeCsv,
} from '@/lib/server-session';

export async function GET(request: Request) {
  try {
    const rows = await sendAuthorizedTcpMessage<Record<string, unknown>[]>(
      request,
      { cmd: 'export_patients_csv' },
      {},
      [UserRole.ADMIN],
      'patients',
    );

    return new Response(serializeCsv(rows), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="patients.csv"',
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
