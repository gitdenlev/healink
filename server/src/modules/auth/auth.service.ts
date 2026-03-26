import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { Admin, UserRole } from 'src/modules/admins/entities/admin.entity';
import { Doctor } from 'src/apps/doctors/modules/doctors/doctor.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly jwtService: JwtService,
  ) {}

  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async validateUser(email: string, pass: string): Promise<any> {
    if (!email || !pass) {
      return null;
    }

    // 1. Try to find in Admins
    let user: any = await this.adminRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'role',
        'firstName',
        'lastName',
        'avatarUrl',
      ],
    });

    // 2. If not found, try to find in Doctors
    if (!user) {
      user = await this.doctorRepository.findOne({
        where: { email },
        select: [
          'id',
          'email',
          'password',
          'role',
          'firstName',
          'lastName',
          'avatarUrl',
          'department',
        ],
      });
    }

    const passwordHash =
      user && typeof user.password === 'string' ? user.password : null;

    if (!passwordHash) {
      return null;
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(pass, passwordHash);
    } catch {
      return null;
    }

    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(email: string, pass: string) {
    const user = await this.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateGoogleUser(token: string): Promise<any> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = payload?.email;

      if (!email) {
        throw new UnauthorizedException('No email linked to this Google account');
      }

      // 1. Try to find in Admins
      let user: any = await this.adminRepository.findOne({
        where: { email },
        select: ['id', 'email', 'role', 'firstName', 'lastName', 'avatarUrl'],
      });

      // 2. Try to find in Doctors
      if (!user) {
        user = await this.doctorRepository.findOne({
          where: { email },
          select: ['id', 'email', 'role', 'firstName', 'lastName', 'avatarUrl', 'department'],
        });
      }

      if (!user) {
        throw new UnauthorizedException('Користувач з таким email не зареєстрований в системі.');
      }

      return user;
    } catch (error) {
       console.error('Google Auth Error:', error);
       throw new UnauthorizedException('Не вдалося авторизуватися через Google.');
    }
  }

  async loginWithGoogle(token: string) {
    const user = await this.validateGoogleUser(token);
    if (!user) {
      throw new UnauthorizedException('Invalid Google credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }
}

