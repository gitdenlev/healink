import { NextResponse } from 'next/server';
import { sendTcpMessage } from '@/lib/tcp-client';
import { applyAuthCookies } from '@/lib/server-session';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const maybeError = error as any;
    if (typeof maybeError.message === 'string') return maybeError.message;
    if (typeof maybeError.error === 'string') return maybeError.error;
    if (typeof maybeError.err === 'string') return maybeError.err;
    const nestedMessage = maybeError.response?.message;
    if (typeof nestedMessage === 'string') return nestedMessage;
    if (Array.isArray(nestedMessage) && nestedMessage.every((item) => typeof item === 'string')) {
      return nestedMessage.join(', ');
    }
  }
  return 'Internal Server Error';
}

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const response = await sendTcpMessage<{
      user: Record<string, unknown>;
      access_token: string;
    }>('loginWithGoogle', { token }, 'patients');

    const nextResponse = NextResponse.json(response);
    applyAuthCookies(nextResponse, response.access_token);
    return nextResponse;
  } catch (error: unknown) {
    console.error('Google Login error:', error);
    const message = getErrorMessage(error);
    const status = /invalid|unauthorized/i.test(message) ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
