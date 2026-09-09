import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";
const classes: Record<OrderStatus, string> = { PENDING: "border-warning/40 bg-warning/10 text-warning", CONFIRMED: "border-success/40 bg-success/10 text-success", CANCELLED: "border-danger/40 bg-danger/10 text-red-300" };
export function OrderStatusBadge({ status }: { status: OrderStatus }) { return <Badge variant="outline" className={classes[status]}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>; }
