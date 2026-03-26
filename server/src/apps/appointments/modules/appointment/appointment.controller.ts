import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppointmentService } from './appointment.service';
import { requireRole } from 'src/modules/auth/permissions';
import { UserRole } from 'src/modules/admins/entities/admin.entity';
import { AppointmentFormat, AppointmentPriority } from './appointment.entity';

@Controller()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @MessagePattern({ cmd: 'get_appointments_total' })
  async getAppointmentsCount(): Promise<number> {
    return this.appointmentService.countAll();
  }

  @MessagePattern({ cmd: 'get_appointments_stats' })
  async getAppointmentsStats(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.appointmentService.getStats();
  }

  @MessagePattern({ cmd: 'get_appointments_paginated' })
  async getAppointmentsPaginated(
    @Payload()
    data: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      actor?: { userId: string; role: UserRole; email?: string };
    },
  ) {
    const actor = requireRole(data.actor, [UserRole.ADMIN, UserRole.DOCTOR]);
    const { page = 1, limit = 100, search, status } = data;
    return this.appointmentService.findAll(
      page,
      limit,
      search,
      status,
      actor,
    );
  }

  @MessagePattern({ cmd: 'create_appointment' })
  async createAppointment(
    @Payload()
    data: {
      actor?: { userId: string; role: UserRole; email?: string };
      appointment: {
        patientId: string;
        date: string;
        duration: number;
        type: string;
        format: AppointmentFormat;
        priority: AppointmentPriority;
      };
    },
  ) {
    const actor = requireRole(data.actor, [UserRole.DOCTOR]);
    return this.appointmentService.createAppointment(data.appointment, actor);
  }

  @MessagePattern({ cmd: 'export_appointments_csv' })
  async exportAppointments(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.appointmentService.exportCsv();
  }
}
