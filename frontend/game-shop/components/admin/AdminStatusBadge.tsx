import type { OrderStatus } from "@/types";

interface AdminStatusBadgeProps {
  status: OrderStatus;
}

const statusClasses: Record<OrderStatus, string> = {
  PENDING: "border-warning/25 bg-warning/10 text-warning",
  CONFIRMED: "border-success/25 bg-success/10 text-success",
  CANCELLED: "border-danger/25 bg-danger/10 text-danger",
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
