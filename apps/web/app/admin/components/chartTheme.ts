export const chartTokens = {
  tick: "var(--color-muted-contrast)",
  legend: "var(--color-foreground)",
  grid: "var(--color-border-subtle)",
  gridSoft: "var(--color-border)",
  tooltipBg: "var(--color-surface-card)",
  tooltipBorder: "var(--color-border)",
  tooltipText: "var(--color-foreground)",
  tooltipMuted: "var(--color-foreground-soft)",
  primary: "var(--color-chart-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  dangerSoft: "var(--color-danger-soft)",
  surface: "var(--color-surface-card)",
} as const;

export const chartTickStyle = {
  fontSize: 11,
  fontFamily: "var(--font-body)",
  fill: chartTokens.tick,
};

export const chartTooltipStyle = {
  fontFamily: "var(--font-body)",
  fontSize: 13,
  borderRadius: 12,
  border: `1px solid ${chartTokens.tooltipBorder}`,
  backgroundColor: chartTokens.tooltipBg,
  color: chartTokens.tooltipText,
  boxShadow: "0 10px 30px rgb(0 0 0 / 0.18)",
};

export const chartTooltipLabelStyle = {
  color: chartTokens.tooltipText,
  fontWeight: 650,
  marginBottom: 4,
};

export const chartTooltipItemStyle = {
  color: chartTokens.tooltipMuted,
};

export const chartLegendStyle = {
  fontFamily: "var(--font-body)",
  fontSize: 12,
  color: chartTokens.legend,
  paddingTop: 12,
};

export const chartLegendFormatter = (value: string) => value;

export const chartActiveDot = (stroke: string) => ({
  r: 4,
  fill: chartTokens.surface,
  stroke,
  strokeWidth: 2,
});
