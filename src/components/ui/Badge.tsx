import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "violet" | "indigo" | "emerald" | "amber" | "rose" | "sky" | "zinc";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  violet: "badge-violet",
  indigo: "badge-indigo",
  emerald: "badge-emerald",
  amber: "badge-amber",
  rose: "badge-rose",
  sky: "badge-sky",
  zinc: "badge-zinc",
};

export function Badge({
  children,
  className = "",
  variant = "violet",
  size = "md",
  icon,
  ...props
}: BadgeProps) {
  const variantClass = variantStyles[variant] || variantStyles.violet;
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-0.5 text-[10px]";

  return (
    <span
      className={`badge-soip ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
