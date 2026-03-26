import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AnalyticsAppointmentsService } from './analytics-appointments.service';
import { requireRole } from 'src/modules/auth/permissions';
import { UserRole } from 'src/modules/admins/entities/admin.entity';

@Controller()
export class AnalyticsAppointmentsController {
  constructor(private readonly service: AnalyticsAppointmentsService) {}

  @MessagePattern({ cmd: 'analytics.appointments.by_type' })
  async byType(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.service.getByType();
  }

  @MessagePattern({ cmd: 'analytics.appointments.by_payment_method' })
  async byPaymentMethod(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.service.getByPaymentMethod();
  }

  @MessagePattern({ cmd: 'analytics.appointments.by_status' })
  async byStatus(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.service.getByStatus();
  }

  @MessagePattern({ cmd: 'analytics.appointments.by_format' })
  async byFormat(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.service.getByFormat();
  }

  @MessagePattern({ cmd: 'analytics.appointments.by_priority' })
  async byPriority(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.service.getByPriority();
  }

  @MessagePattern({ cmd: 'analytics.appointments.avg_price' })
  async avgPrice(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.service.getAvgPrice();
  }

  @MessagePattern({ cmd: 'analytics.appointments.total_revenue' })
  async totalRevenue(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.service.getTotalRevenue();
  }

  @MessagePattern({ cmd: 'analytics.appointments.avg_duration' })
  async avgDuration(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.service.getAvgDuration();
  }
}
