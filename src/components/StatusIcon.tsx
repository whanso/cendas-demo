import { type ChecklistStatusKeys } from "@/types/schemas";
import clsx from "clsx";

interface StatusIconProps {
  status: ChecklistStatusKeys;
  className?: string;
}

const statusColors: Record<ChecklistStatusKeys, string> = {
  NOT_STARTED: "#cfcfcf",
  IN_PROGRESS: "#ffbe3f",
  BLOCKED: "#ff5252",
  FINAL_CHECK_AWAITING: "#3faeff",
  DONE: "#58e766",
};

/**
 * Darkens a hex color by a given percentage.
 * @param hex The hex color string (e.g., "#RRGGBB").
 * @param percent The percentage to darken by (0-100).
 * @returns The new darkened hex color string.
 */
function darkenColor(hex: string, percent: number): string {
  // Remove '#' if present
  const color = hex.startsWith("#") ? hex.slice(1) : hex;

  // Parse the R, G, B values
  const num = parseInt(color, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  // Apply the darkening factor
  const factor = 1 - percent / 100;
  r = Math.round(r * factor);
  g = Math.round(g * factor);
  b = Math.round(b * factor);

  // Ensure values are within the 0-255 range
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  // Convert back to hex and pad with zeros if needed
  const toHex = (c: number) => c.toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function StatusIcon({ status, className }: StatusIconProps) {
  const fillColor = statusColors[status];
  const strokeColor = darkenColor(fillColor, 20); // Darken by 20%

  return (
    <svg
      className={clsx(className)}
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="8"
        cy="8"
        r="7"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1"
      />
    </svg>
  );
}
