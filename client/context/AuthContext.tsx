'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/lib/auth-types';
import { event } from '@/lib/gtag';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
  canViewAnalytics: boolean;
  canExportCsv: boolean;
  canManageDoctors: boolean;
  canCreatePatients: boolean;
  canCreateAppointments: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const getDefaultPath = (currentUser: User | null) =>
    currentUser?.role === UserRole.ADMIN ? '/analytics/patients' : '/patients';

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('healink_user');
      const savedToken = localStorage.getItem('healink_token');

      setUser(savedUser ? (JSON.parse(savedUser) as User) : null);
      setToken(savedToken);
    } catch {
      localStorage.removeItem('healink_user');
      localStorage.removeItem('healink_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== '/login') {
        router.replace('/login');
      } else if (user && pathname === '/login') {
        router.replace(getDefaultPath(user));
      } else if (user?.role === UserRole.DOCTOR && pathname.startsWith('/analytics')) {
        router.replace('/patients');
      } else if (user && pathname === '/') {
        router.replace(getDefaultPath(user));
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setUser(data.user);
    event({
      action: 'login_success',
      category: 'Auth',
      user_role: data.user.role,
      actor_id: data.user.id,
    });
    setToken(data.access_token);
    localStorage.setItem('healink_user', JSON.stringify(data.user));
    localStorage.setItem('healink_token', data.access_token);
    router.push(data.user.role === UserRole.ADMIN ? '/analytics/patients' : '/patients');
  };

  const loginWithGoogle = async (googleToken: string) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Google Login failed');
    }

    setUser(data.user);
    event({
      action: 'login_success',
      category: 'Auth',
      user_role: data.user.role,
      actor_id: data.user.id,
    });
    setToken(data.access_token);
    localStorage.setItem('healink_user', JSON.stringify(data.user));
    localStorage.setItem('healink_token', data.access_token);
    router.push(data.user.role === UserRole.ADMIN ? '/analytics/patients' : '/patients');
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setToken(null);
    localStorage.removeItem('healink_user');
    localStorage.removeItem('healink_token');

    event({
      action: 'logout',
      category: 'Auth',
      user_role: user?.role,
      actor_id: user?.id,
    });

    router.push('/login');
  };

  const isAdmin = user?.role === UserRole.ADMIN;
  const isDoctor = user?.role === UserRole.DOCTOR;
  const canViewAnalytics = isAdmin;
  const canExportCsv = isAdmin;
  const canManageDoctors = isAdmin;
  const canCreatePatients = isDoctor;
  const canCreateAppointments = isDoctor;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginWithGoogle,
        logout,
        isLoading,
        isAdmin,
        isDoctor,
        canViewAnalytics,
        canExportCsv,
        canManageDoctors,
        canCreatePatients,
        canCreateAppointments,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
