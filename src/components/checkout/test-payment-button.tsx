"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { confirmTestPayment } from "@/server/actions/checkout";

export function TestPaymentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      size="lg"
      className="w-full"
      loading={pending}
      onClick={() =>
        start(async () => {
          const r = await confirmTestPayment(orderId);
          if (!r.ok) {
            toast.error(r.error);
            return;
          }
          router.push(`/checkout/success?order=${orderId}`);
        })
      }
    >
      Simulate successful payment <ArrowRight />
    </Button>
  );
}
