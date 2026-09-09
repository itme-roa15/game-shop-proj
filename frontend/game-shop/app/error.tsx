"use client";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/shared/error-banner";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="page-shell py-16"><div className="mx-auto max-w-xl"><ErrorBanner message="Something unexpected happened while loading this page." /><Button className="mt-4" onClick={reset}>Try again</Button></div></div>; }
