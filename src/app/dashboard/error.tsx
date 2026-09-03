"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      icon={AlertTriangle}
      title="Something went wrong loading this page"
      description={error.message || "An unexpected error occurred. Try again, and contact us if it keeps happening."}
      action={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Go to overview</Link>
          </Button>
          <Button onClick={reset}>Try again</Button>
        </div>
      }
    />
  );
}
