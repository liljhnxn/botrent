import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: "cyan" | "purple" | "emerald" | "amber";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "cyan",
}: StatCardProps) {
  const colorMap = {
    cyan: {
      border: "border-brand-cyan/20 hover:border-brand-cyan/40",
      iconBg: "bg-brand-cyan/10 text-brand-cyan",
      glow: "group-hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]",
    },
    purple: {
      border: "border-brand-purple/20 hover:border-brand-purple/40",
      iconBg: "bg-brand-purple/10 text-brand-purple",
      glow: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
    },
    emerald: {
      border: "border-brand-emerald/20 hover:border-brand-emerald/40",
      iconBg: "bg-brand-emerald/10 text-brand-emerald",
      glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    },
    amber: {
      border: "border-brand-amber/20 hover:border-brand-amber/40",
      iconBg: "bg-brand-amber/10 text-brand-amber",
      glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    },
  };

  const currentTheme = colorMap[color];

  return (
    <div
      className={`group relative rounded-2xl bg-surface-100/80 backdrop-blur-md p-6 border ${currentTheme.border} ${currentTheme.glow} transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${currentTheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-semibold text-brand-emerald">
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
