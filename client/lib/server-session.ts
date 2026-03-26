import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { sendTcpMessage, ServiceName } from '@/lib/tcp-client';
import { UserRole } from '@/lib/auth-types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_change_me';
const TOKEN_COOKIE = 'healink_token';

export interface SessionActor {
  userId: string;
  email?: string;
  role: UserRole;
}

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: UserRole;
  exp?: number;
}

function toBase64Url(input: Buffer) {
  return input.toString('base64url');
}

function parseCookies(header: string | null): Record<string, string> {
  if (!header) {
    return {};
  }

  return header
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const [key, ...value] = part.split('=');
      acc[key] = decodeURIComponent(value.join('='));
      return acc;
    }, {});
}

function verifyJwt(token: string): JwtPayload {
  const [header, payload, signature] = token.split('.');

  if (!header || !payload || !signature) {
    throw new Error('Invalid token');
  }

  const data = `${header}.${payload}`;
  const expectedSignature = toBase64Url(
    createHmac('sha256', JWT_SECRET).update(data).digest(),
  );

  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new Error('Invalid token signature');
  }

  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as JwtPayload;

  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    throw new Error('Token expired');
  }

  return decoded;
}

export function getSessionFromRequest(request: Request): SessionActor {
  const cookies = parseCookies(request.headers.get('cookie'));
  const token = cookies[TOKEN_COOKIE];

  if (!token) {
    throw new Error('Authentication required');
  }

  const payload = verifyJwt(token);

  if (!payload.sub || !payload.role) {
    throw new Error('Invalid session payload');
  }

  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}

export function requireSession(
  request: Request,
  allowedRoles?: UserRole[],
): SessionActor {
  const session = getSessionFromRequest(request);

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error('Insufficient permissions');
  }

  return session;
}

export async function sendAuthorizedTcpMessage<TResponse>(
  request: Request,
  pattern: string | { cmd: string },
  data: Record<string, unknown> = {},
  allowedRoles?: UserRole[],
  service: ServiceName = 'patients',
): Promise<TResponse> {
  const actor = requireSession(request, allowedRoles);
  return sendTcpMessage<TResponse>(pattern, {
    ...data,
    actor,
  }, service);
}

export function handleRouteError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal Server Error';

  if (/authentication required|invalid token|token expired|invalid session/i.test(message)) {
    return NextResponse.json({ error: message }, { status: 401 });
  }

  if (/insufficient permissions|forbidden/i.test(message)) {
    return NextResponse.json({ error: message }, { status: 403 });
  }

  if (/invalid credentials|unauthorized/i.test(message)) {
    return NextResponse.json({ error: message }, { status: 401 });
  }

  if (/not found/i.test(message)) {
    return NextResponse.json({ error: message }, { status: 404 });
  }

  if (/already exists|cannot be deleted|assigned to another doctor|bad request|conflict/i.test(message)) {
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ error: message }, { status: 500 });
}

export function applyAuthCookies(response: NextResponse, token: string) {
  response.cookies.set({
    name: TOKEN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set({
    name: TOKEN_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
}

export function serializeCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const escapeCell = (value: unknown) =>
    `"${String(value ?? '').replaceAll('"', '""')}"`;

  const body = rows.map((row) => headers.map((header) => escapeCell(row[header])).join(','));
  return [headers.join(','), ...body].join('\n');
}
