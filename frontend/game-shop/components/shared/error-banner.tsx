import { CircleAlert } from "lucide-react";
export function ErrorBanner({ message }: { message: string }) { return <div role="alert" className="flex items-start gap-3 rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-red-200"><CircleAlert className="mt-0.5 size-4 shrink-0" />{message}</div>; }
