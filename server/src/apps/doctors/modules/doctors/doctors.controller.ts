import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DoctorsService } from './doctors.service';
import { requireRole } from 'src/modules/auth/permissions';
import { UserRole } from 'src/modules/admins/entities/admin.entity';

@Controller()
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @MessagePattern({ cmd: 'get_doctors_count' })
  async getDoctorsCount(): Promise<number> {
    return this.doctorsService.countAll();
  }

  @MessagePattern({ cmd: 'get_doctors_stats' })
  async getDoctorsStats(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.doctorsService.getStats();
  }

  @MessagePattern({ cmd: 'get_doctors_paginated' })
  async findAll(
    @Payload()
    data: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
    },
  ) {
    return this.doctorsService.findAll(
      data.page,
      data.limit,
      data.search,
      data.status,
    );
  }

  @MessagePattern({ cmd: 'create_doctor' })
  async createDoctor(
    @Payload()
    data: {
      actor?: { userId: string; role: UserRole };
      doctor: {
        firstName: string;
        lastName: string;
        email: string;
        password?: string;
        department: string;
        specialty: string;
        gender?: string;
      };
    },
  ) {
    requireRole(data.actor, [UserRole.ADMIN]);
    return this.doctorsService.createDoctor(data.doctor);
  }

  @MessagePattern({ cmd: 'delete_doctor' })
  async deleteDoctor(
    @Payload()
    data: {
      actor?: { userId: string; role: UserRole };
      doctorId: string;
    },
  ) {
    requireRole(data.actor, [UserRole.ADMIN]);
    return this.doctorsService.deleteDoctor(data.doctorId);
  }

  @MessagePattern({ cmd: 'export_doctors_csv' })
  async exportDoctors(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.doctorsService.exportCsv();
  }
}
