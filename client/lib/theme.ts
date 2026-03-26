import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "teal",
  colors: {
    teal: [
      "#e3fafa",
      "#c5f0f0",
      "#91e1e1",
      "#57cccc",
      "#2bb5b5",
      "#038080", // Main color
      "#037575",
      "#026666",
      "#015858",
      "#014848",
    ],
  },
  components: {
    Button: {
      defaultProps: {
        variant: "filled",
        radius: "md",
      },
    },
    UnstyledButton: {
      styles: {
        root: {
          borderRadius: "var(--mantine-radius-md)",
        },
      },
    },
    Tooltip: {
      defaultProps: {
        color: "teal",
        radius: "md",
      },
    },
    Skeleton: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          '&::before': { display: 'none' },
          '&::after': { display: 'none' },
          backgroundColor: 'var(--mantine-color-gray-1)',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(90deg, var(--mantine-color-gray-1) 25%, var(--mantine-color-gray-0) 50%, var(--mantine-color-gray-1) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite linear',
        },
      },
    },
  },
});
