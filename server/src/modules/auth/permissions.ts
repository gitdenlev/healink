import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from 'src/modules/admins/entities/admin.entity';
import { AuthActor } from './auth-actor.interface';

export function requireActor(actor?: AuthActor): AuthActor {
  if (!actor?.userId || !actor.role) {
    throw new UnauthorizedException('Authentication required');
  }

  return actor;
}

export function requireRole(
  actor: AuthActor | undefined,
  allowedRoles: UserRole[],
): AuthActor {
  const session = requireActor(actor);

  if (!allowedRoles.includes(session.role)) {
    throw new ForbiddenException('Insufficient permissions');
  }

  return session;
}
