import { Controller } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { requireRole } from 'src/modules/auth/permissions';
import { UserRole } from 'src/modules/admins/entities/admin.entity';

@Controller()
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @MessagePattern({ cmd: 'get_total_patients' })
  async countAll(): Promise<number> {
    return this.patientsService.countAll();
  }

  @MessagePattern({ cmd: 'get_patients_stats' })
  async getStats(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return await this.patientsService.getStats();
  }

  @MessagePattern({ cmd: 'get_average_age' })
  async averageAge(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return await this.patientsService.averageAge();
  }

  @MessagePattern({ cmd: 'get_patients_paginated' })
  async findAll(
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
    return this.patientsService.findAll(
      data.page,
      data.limit,
      data.search,
      data.status,
      actor,
    );
  }

  @MessagePattern({ cmd: 'create_patient' })
  async createPatient(
    @Payload()
    data: {
      actor?: { userId: string; role: UserRole; email?: string };
      patient: {
        firstName: string;
        lastName: string;
        gender: string;
        dateOfBirth: string;
        city?: string;
        allergy?: string;
        disease?: string;
        contactNumber?: string;
        email?: string;
      };
    },
  ) {
    const actor = requireRole(data.actor, [UserRole.DOCTOR]);
    return this.patientsService.createPatient(data.patient, actor);
  }

  @MessagePattern({ cmd: 'archive_patient' })
  async archivePatient(
    @Payload()
    data: {
      actor?: { userId: string; role: UserRole; email?: string };
      patientId: string;
    },
  ) {
    const actor = requireRole(data.actor, [UserRole.DOCTOR]);
    return this.patientsService.archivePatient(data.patientId, actor);
  }

  @MessagePattern({ cmd: 'restore_patient' })
  async restorePatient(
    @Payload()
    data: {
      actor?: { userId: string; role: UserRole; email?: string };
      patientId: string;
    },
  ) {
    const actor = requireRole(data.actor, [UserRole.DOCTOR]);
    return this.patientsService.restorePatient(data.patientId, actor);
  }

  @MessagePattern({ cmd: 'export_patients_csv' })
  async exportPatients(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.patientsService.exportCsv();
  }
}
