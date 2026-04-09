import { Puzzle } from "lucide-react";

interface AppLogoProps {
  /** Size of the logo container (icon scales with it). */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-12 w-12 rounded-xl",
  md: "h-16 w-16 rounded-2xl",
  lg: "h-20 w-20 rounded-3xl",
};

const iconSizes = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

/**
 * App logo: teal/mint gradient squircle with white outline puzzle piece (slightly rotated).
 * Matches the Creative Puzzle Studio branding.
 */
export function AppLogo({ size = "lg", className = "" }: AppLogoProps) {
  return (
    <div
      className={`flex items-center justify-center shadow-lg shadow-teal-900/20 ${sizeClasses[size]} ${className}`}
      style={{
        background: "linear-gradient(to bottom, hsl(160, 40%, 78%), hsl(160, 45%, 58%))",
      }}
      aria-hidden
    >
      <Puzzle
        className={`${iconSizes[size]} text-white shrink-0`}
        strokeWidth={2.25}
        style={{ transform: "rotate(8deg)" }}
      />
    </div>
  );
}
