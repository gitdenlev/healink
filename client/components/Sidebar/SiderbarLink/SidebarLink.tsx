import { Tooltip, UnstyledButton } from "@mantine/core";
import classes from "../NavbarMinimal.module.scss";
import type { NavbarLinkProps } from "./SidebarLink.types";

export function SidebarLink({
  icon: Icon,
  label,
  active,
  onClick,
}: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
        aria-label={label}
      >
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}
