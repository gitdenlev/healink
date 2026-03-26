import { Box, Text, Tooltip } from "@mantine/core";
import { useMemo, useRef, useState } from "react";

export interface BarData {
  name: string;
  value: number;
  values?: { value: number; color: string }[];
}

interface CustomBarChartProps {
  data: BarData[];
  color?: string;
  horizontal?: boolean;
}

const TEAL_RAMP: Record<string, string> = {
  "teal.1": "#C3FAE8", "teal.2": "#96F2D7", "teal.3": "#63E6BE",
  "teal.4": "#38D9A9", "teal.5": "#20C997", "teal.6": "#12B886",
  "teal.7": "#0CA678", "teal.8": "#099268", "teal.9": "#087F5B",
  "blue.5": "#339AF0", "blue.6": "#228BE6", "blue.7": "#1C7ED6",
  "cyan.5": "#22B8CF", "cyan.6": "#15AABF", "cyan.7": "#1098AD",
  "indigo.5": "#5C7CFA", "indigo.6": "#4C6EF5", "indigo.7": "#4263EB",
  "violet.5": "#845EF7", "violet.6": "#7950F2", "violet.7": "#6741D9",
  "pink.5": "#F06595",  "pink.6": "#E64980",  "pink.7": "#D6336C",
  "red.5": "#FF6B6B",   "red.6": "#FA5252",   "red.7": "#F03E3E",
  "orange.5": "#FF922B","orange.6": "#FD7E14", "orange.7": "#F76707",
  "yellow.5": "#FFD43B","yellow.6": "#FCC419", "yellow.7": "#FAB005",
  "green.5": "#51CF66", "green.6": "#40C057", "green.7": "#37B24D",
  "lime.5": "#94D82D",  "lime.6": "#82C91E",  "lime.7": "#74B816",
  "gray.5": "#ADB5BD",  "gray.6": "#868E96",  "gray.7": "#495057",
};

function resolveColor(c: string): string {
  return TEAL_RAMP[c] ?? `var(--mantine-color-${c.replace(".", "-")})`;
}

function niceMax(v: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(v || 1)));
  return Math.ceil(v / exp) * exp;
}

const H = 200;
const PAD_L = 44;
const PAD_B = 36;
const PAD_T = 12;
const TICK_COUNT = 4;

export function CustomBarChart({ data, color = "teal.7" }: CustomBarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const maxVal = useMemo(() => {
    const all = data.flatMap((d) => d.values ? d.values.map((v) => v.value) : [d.value]);
    return niceMax(Math.max(...all, 1));
  }, [data]);

  const ticks = useMemo(
    () => Array.from({ length: TICK_COUNT + 1 }, (_, i) => (maxVal / TICK_COUNT) * i),
    [maxVal]
  );

  const toY = (v: number) => PAD_T + H - (v / maxVal) * H;
  const barH = (v: number) => (v / maxVal) * H;

  /* ── bar geometry ── */
  const BAR_W = Math.max(10, Math.min(28, Math.floor(560 / (data.length * 3))));
  const GROUP_GAP = 6;

  return (
    <Box style={{ width: "100%", minHeight: 280 }}>
      <svg
        ref={svgRef}
        width="100%"
        height={H + PAD_B + PAD_T}
        style={{ overflow: "visible", display: "block" }}
      >
        {/* ── grid + y-axis ── */}
        {ticks.map((tick, i) => {
          const y = toY(tick);
          return (
            <g key={i}>
              <line
                x1={PAD_L}
                y1={y}
                x2="100%"
                y2={y}
                stroke={i === 0 ? "var(--mantine-color-gray-3)" : "var(--mantine-color-gray-2)"}
                strokeWidth={i === 0 ? 1 : 0.75}
                strokeDasharray={i === 0 ? "0" : "3 5"}
              />
              <text
                x={PAD_L - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="central"
                fontSize={11}
                fill="var(--mantine-color-gray-5)"
                fontFamily="var(--mantine-font-family)"
              >
                {tick >= 1000 ? `${tick / 1000}k` : tick}
              </text>
            </g>
          );
        })}

        {/* ── bars ── */}
        {data.map((item, gi) => {
          const bars = item.values ?? [{ value: item.value, color }];
          const groupW = bars.length * BAR_W + (bars.length - 1) * GROUP_GAP;
          const groupPct = (gi + 0.5) / data.length;
          const isHovered = hovered === gi;
          const isDimmed = hovered !== null && !isHovered;

          return (
            <g
              key={item.name}
              onMouseEnter={() => setHovered(gi)}
              onMouseLeave={() => setHovered(null)}
              style={{ transition: "opacity 150ms ease" }}
              opacity={isDimmed ? 0.3 : 1}
            >
              {bars.map((bar, bi) => {
                const h = Math.max(barH(bar.value), bar.value > 0 ? 2 : 0);
                const y = toY(bar.value);
                const fill = resolveColor(bar.color);
                const hoverFill = bar.color.includes(".")
                  ? resolveColor(bar.color.replace(/\.\d+$/, (m) => `.${Math.max(1, parseInt(m.slice(1)) - 2)}`))
                  : fill;

                return (
                  <Tooltip
                    key={bi}
                    label={
                      <Text size="xs" fw={500}>
                        {item.name}
                        {bars.length > 1 && ` · ${bi + 1}`}:{" "}
                        <Text span c="white" fw={700}>{bar.value}</Text>
                      </Text>
                    }
                    color="dark.7"
                    withArrow
                    offset={6}
                    transitionProps={{ transition: "pop", duration: 150 }}
                  >
                    <rect
                      x={`calc(${PAD_L}px + (100% - ${PAD_L}px) * ${groupPct} - ${groupW / 2}px + ${bi * (BAR_W + GROUP_GAP)}px)`}
                      y={y}
                      width={BAR_W}
                      height={h}
                      rx={4}
                      ry={4}
                      fill={isHovered ? hoverFill : fill}
                      style={{
                        cursor: "pointer",
                        transition: "fill 150ms ease, y 150ms ease, height 150ms ease",
                        filter: isHovered ? "brightness(1.08)" : "none",
                      }}
                    />
                  </Tooltip>
                );
              })}
            </g>
          );
        })}
      </svg>
    </Box>
  );
}
