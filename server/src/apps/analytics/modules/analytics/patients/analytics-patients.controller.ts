import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AnalyticsPatientsService } from './analytics-patients.service';
import { requireRole } from 'src/modules/auth/permissions';
import { UserRole } from 'src/modules/admins/entities/admin.entity';

@Controller()
export class AnalyticsPatientsController {
  constructor(
    private readonly analyticsPatientsService: AnalyticsPatientsService,
  ) {}

  @MessagePattern({ cmd: 'get_patients_gender_ratio' })
  async getGenderRatio(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return await this.analyticsPatientsService.getGenderRatio();
  }

  @MessagePattern({ cmd: 'get_patients_top_cities' })
  async getTopCities(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return await this.analyticsPatientsService.topCities();
  }

  @MessagePattern({ cmd: 'get_patients_allergies' })
  async getAllergies(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return await this.analyticsPatientsService.allergies();
  }

  @MessagePattern({ cmd: 'get_patients_diseases' })
  async getDiseases(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return await this.analyticsPatientsService.diseases();
  }

  @MessagePattern({ cmd: 'get_patients_age_groups' })
  async getAgeGroups(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return await this.analyticsPatientsService.ageGroups();
  }
}
