import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "feature" | "metric";
}

export function Card({
  children,
  className = "",
  variant = "default",
  ...props
}: CardProps) {
  let baseClass = "card-soip";
  if (variant === "interactive") baseClass = "card-interactive-soip";
  if (variant === "feature") baseClass = "card-feature-soip";
  if (variant === "metric") baseClass = "card-metric-soip";

  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 pb-2 space-y-1 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`card-title ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`body-muted ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function MetricCard({
  label,
  value,
  subValue,
  icon,
  trend,
  className = "",
}: MetricCardProps) {
  return (
    <div className={`card-metric-soip space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="caption-text">{label}</span>
        {icon && <div className="text-zinc-400 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80">{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-xl sm:text-2xl font-bold font-sans text-zinc-100 tracking-tight">
          {value}
        </div>
        {trend && (
          <span
            className={`text-[10px] font-mono font-semibold ${
              trend.isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      {subValue && <div className="meta-text text-[10px] text-zinc-500">{subValue}</div>}
    </div>
  );
}

export default Card;
