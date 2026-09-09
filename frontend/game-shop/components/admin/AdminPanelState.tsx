import { AlertTriangle, LoaderCircle } from "lucide-react";

interface AdminPanelStateProps {
  kind: "loading" | "error" | "empty";
  message: string;
}

export function AdminPanelState({ kind, message }: AdminPanelStateProps) {
  const Icon = kind === "loading" ? LoaderCircle : AlertTriangle;

  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 px-6 text-center">
      <Icon
        className={`size-6 ${kind === "loading" ? "animate-spin text-accent motion-reduce:animate-none" : "text-text-muted"}`}
        aria-hidden="true"
      />
      <p className="max-w-md text-sm text-text-secondary">{message}</p>
    </div>
  );
}
