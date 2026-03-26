import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AnalyticsDoctorsService } from './analytics-doctors.service';
import { requireRole } from 'src/modules/auth/permissions';
import { UserRole } from 'src/modules/admins/entities/admin.entity';

@Controller()
export class AnalyticsDoctorsController {
  constructor(private readonly analyticsService: AnalyticsDoctorsService) {}

  @MessagePattern({ cmd: 'analytics.doctors.gender' })
  async gender(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.analyticsService.getGenderRatio();
  }

  @MessagePattern({ cmd: 'analytics.doctors.experience' })
  async experience(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.analyticsService.getExperienceDistribution();
  }

  @MessagePattern({ cmd: 'analytics.doctors.department' })
  async department(
    @Payload() data?: { actor?: { userId: string; role: UserRole } },
  ) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.analyticsService.getDepartmentDistribution();
  }

  @MessagePattern({ cmd: 'analytics.doctors.top' })
  async top(@Payload() data?: { actor?: { userId: string; role: UserRole } }) {
    requireRole(data?.actor, [UserRole.ADMIN]);
    return this.analyticsService.getTopDoctorsByPatientLoad();
  }
}
