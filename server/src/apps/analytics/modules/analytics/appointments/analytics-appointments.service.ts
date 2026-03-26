import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from 'src/apps/appointments/modules/appointment/appointment.entity';

@Injectable()
export class AnalyticsAppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  async getByType() {
    return await this.appointmentRepo
      .createQueryBuilder('appointments')
      .select('appointments.type', 'name')
      .addSelect('COUNT(appointments.id)', 'value')
      .groupBy('appointments.type')
      .orderBy('value', 'DESC')
      .limit(6)
      .getRawMany();
  }

  async getByPaymentMethod() {
    return await this.appointmentRepo
      .createQueryBuilder('appointments')
      .select('appointments.payment_method', 'name')
      .addSelect('COUNT(appointments.id)', 'value')
      .groupBy('appointments.payment_method')
      .orderBy('value', 'DESC')
      .getRawMany();
  }

  async getByStatus() {
    return await this.appointmentRepo
      .createQueryBuilder('appointments')
      .select('appointments.status', 'name')
      .addSelect('COUNT(appointments.id)', 'value')
      .groupBy('appointments.status')
      .orderBy('value', 'DESC')
      .getRawMany();
  }

  async getByFormat() {
    return await this.appointmentRepo
      .createQueryBuilder('appointments')
      .select('appointments.format', 'name')
      .addSelect('COUNT(appointments.id)', 'value')
      .groupBy('appointments.format')
      .orderBy('value', 'DESC')
      .getRawMany();
  }

  async getByPriority() {
    return await this.appointmentRepo
      .createQueryBuilder('appointments')
      .select('appointments.priority', 'name')
      .addSelect('COUNT(appointments.id)', 'value')
      .groupBy('appointments.priority')
      .orderBy('value', 'DESC')
      .getRawMany();
  }

  async getAvgPrice() {
    const result = await this.appointmentRepo
      .createQueryBuilder('appointments')
      .select('AVG(appointments.price)', 'avgPrice')
      .getRawOne();
    return {
      avgPrice: result?.avgPrice ? Math.round(Number(result.avgPrice)) : 0,
    };
  }

  async getTotalRevenue() {
    const result = await this.appointmentRepo
      .createQueryBuilder('appointments')
      .select('SUM(appointments.price)', 'totalRevenue')
      .getRawOne();
    return {
      totalRevenue: result?.totalRevenue
        ? Math.round(Number(result.totalRevenue))
        : 0,
    };
  }

  async getAvgDuration() {
    const result = await this.appointmentRepo
      .createQueryBuilder('appointments')
      .select('AVG(appointments.duration)', 'avgDuration')
      .getRawOne();
    return {
      avgDuration: result?.avgDuration
        ? Math.round(Number(result.avgDuration))
        : 0,
    };
  }
}
