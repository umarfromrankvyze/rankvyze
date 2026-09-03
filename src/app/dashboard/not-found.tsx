import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="We couldn't find that"
      description="It may have been removed, or the link is from a different workspace."
      action={
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to overview</Link>
        </Button>
      }
    />
  );
}
