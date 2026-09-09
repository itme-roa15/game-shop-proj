import type { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "accent" | "success" | "warning" | "danger";
}

const toneClasses = {
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  tone = "accent",
}: AdminStatCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-[0_4px_24px_rgba(0,0,0,.4)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="heading mt-2 text-3xl font-bold tracking-tight text-text-primary">
            {value.toLocaleString()}
          </p>
        </div>
        <span className={`rounded-xl p-3 ${toneClasses[tone]}`} aria-hidden="true">
          <Icon className="size-5" />
        </span>
      </div>
    </article>
  );
}
