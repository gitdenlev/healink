"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Center, Stack, Popover, UnstyledButton, Tooltip } from "@mantine/core";
import {
  IconLogout,
  IconMedicalCrossFilled,
  IconDeviceDesktopAnalytics,
  IconUsers,
  IconStethoscope,
  IconCalendarStats,
  IconShieldCheck,
  IconCalendarEvent,
  IconUser,
} from "@tabler/icons-react";

import classes from "./NavbarMinimal.module.scss";
import { SidebarLink } from "./SiderbarLink/SidebarLink";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/lib/auth-types";

const analyticsSublinks = [
  { icon: IconUsers, label: "Patients", url: "/analytics/patients" },
  { icon: IconStethoscope, label: "Doctors", url: "/analytics/doctors" },
  {
    icon: IconCalendarEvent,
    label: "Appointments",
    url: "/analytics/appointments",
  },
];

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.DOCTOR]: "Doctor",
};

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [opened, setOpened] = useState(false);

  const { user, isAdmin, logout } = useAuth();

  if (pathname === "/login" || !user) return null;

  const isAnalyticsActive = pathname.startsWith("/analytics");
  const mainLinks = [
    { icon: IconUsers, label: "Patients", url: "/patients" },
    ...(isAdmin
      ? [{ icon: IconStethoscope, label: "Doctors", url: "/doctors" }]
      : []),
    { icon: IconCalendarStats, label: "Appointments", url: "/appointments" },
  ];
  const firstName = user.firstName?.trim() || "—";
  const lastName = user.lastName?.trim() || "—";
  const roleLabel = roleLabels[user.role] ?? user.role;
  const UserRoleIcon =
    user.role === UserRole.ADMIN
      ? IconShieldCheck
      : user.role === UserRole.DOCTOR
      ? IconStethoscope
      : IconUser;

  return (
    <nav className={classes.navbar}>
      <Center>
        <IconMedicalCrossFilled color="teal" size={28} stroke={1.5} />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={5}>
          {/* Analytics with popover submenu - ADMIN ONLY */}
          {isAdmin && (
            <Popover
              position="right-start"
              shadow="md"
              offset={20}
              radius="md"
              opened={opened}
              onChange={setOpened}
            >
              <Popover.Target>
                <Tooltip
                  label="Analytics"
                  position="right"
                  transitionProps={{ duration: 0 }}
                >
                  <UnstyledButton
                    className={classes.link}
                    data-active={isAnalyticsActive || undefined}
                    aria-label="Analytics"
                    onClick={() => setOpened((o) => !o)}
                  >
                    <IconDeviceDesktopAnalytics size={20} stroke={1.5} />
                  </UnstyledButton>
                </Tooltip>
              </Popover.Target>

              <Popover.Dropdown
                p={8}
                style={{
                  minWidth: 180,
                  backgroundColor: "var(--mantine-color-gray-0)",
                }}
              >
                <Stack gap={2}>
                  {analyticsSublinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.url;
                    return (
                      <UnstyledButton
                        key={link.url}
                        onClick={() => {
                          setOpened(false);
                          router.push(link.url);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "5px 10px",
                          borderRadius: 6,
                          backgroundColor: isActive
                            ? "var(--mantine-color-teal-6)"
                            : "transparent",
                          color: isActive
                            ? "var(--mantine-color-white)"
                            : "var(--mantine-color-dark-4)",
                          fontWeight: 500,
                          fontSize: 14,
                          transition: "background-color 120ms ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive)
                            (
                              e.currentTarget as HTMLElement
                            ).style.backgroundColor =
                              "var(--mantine-color-gray-2)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive)
                            (
                              e.currentTarget as HTMLElement
                            ).style.backgroundColor = "transparent";
                        }}
                      >
                        <Icon size={16} stroke={1.5} />
                        {link.label}
                      </UnstyledButton>
                    );
                  })}
                </Stack>
              </Popover.Dropdown>
            </Popover>
          )}

          {mainLinks.map((link) => (
            <SidebarLink
              key={link.url}
              icon={link.icon}
              label={link.label}
              active={pathname === link.url}
              onClick={() => router.push(link.url)}
            />
          ))}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <Popover
          position="right-end"
          shadow="md"
          offset={12}
          radius="md"
          width={220}
        >
          <Popover.Target>
            <Tooltip
              label="Profile"
              position="right"
              transitionProps={{ duration: 0 }}
            >
              <UnstyledButton
                className={classes.link}
                aria-label="Current account"
              >
                <UserRoleIcon size={20} stroke={1.6} />
              </UnstyledButton>
            </Tooltip>
          </Popover.Target>

          <Popover.Dropdown p={10} className={classes.accountPopover}>
            <div className={classes.accountHeader}>
              <UserRoleIcon size={18} stroke={1.7} />
              <span className={classes.accountRole}>{roleLabel}</span>
            </div>
            <strong className={classes.accountMetaValue}>
              {lastName} {firstName}
            </strong>
          </Popover.Dropdown>
        </Popover>
        <SidebarLink icon={IconLogout} label="Logout" onClick={logout} />
      </Stack>
    </nav>
  );
}
