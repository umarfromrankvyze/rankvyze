"use client";

import { useTransition } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { beginCheckout } from "@/server/actions/checkout";

export function PayButton({ scanId, label }: { scanId?: string; label: string }) {
  const [pending, start] = useTransition();

  return (
    <Button
      size="xl"
      className="w-full"
      loading={pending}
      onClick={() =>
        start(async () => {
          const r = await beginCheckout(scanId);
          if (!r.ok) {
            toast.error(r.error);
            return;
          }
          if (r.data?.redirectUrl) window.location.href = r.data.redirectUrl;
        })
      }
    >
      {!pending && <Lock className="size-4" />}
      {label}
      {!pending && <ArrowRight />}
    </Button>
  );
}
