import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
export default function NotFound() { return <div className="page-shell py-20"><EmptyState title="Page not found" description="This route slipped into another dimension." action={<Button asChild><Link href="/">Return home</Link></Button>} /></div>; }
