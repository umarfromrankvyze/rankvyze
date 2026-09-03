"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PLANS, type Plan } from "@/lib/enums";
import { setCustomerPlan, setIntegrationStatus } from "@/server/actions/admin";

export function PlanSelect({ orgId, plan }: { orgId: string; plan: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="w-40">
      <Select
        value={plan}
        disabled={pending}
        onChange={(e) =>
          start(async () => {
            const r = await setCustomerPlan(orgId, e.target.value as Plan);
            if (r.ok) toast.success(r.message); else toast.error(r.error);
          })
        }
        className="h-9"
        aria-label="Plan"
      >
        {PLANS.map((p) => (
          <option key={p} value={p}>
            {p.charAt(0) + p.slice(1).toLowerCase()}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function IntegrationToggle({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const set = (s: "CONNECTED" | "NOT_CONNECTED" | "ERROR") =>
    start(async () => {
      const r = await setIntegrationStatus(id, s);
      if (r.ok) toast.success(r.message); else toast.error(r.error);
    });
  return (
    <div className="flex gap-1">
      {status !== "CONNECTED" && (
        <Button size="sm" variant="outline" onClick={() => set("CONNECTED")} loading={pending}>
          Mark connected
        </Button>
      )}
      {status !== "NOT_CONNECTED" && (
        <Button size="sm" variant="ghost" onClick={() => set("NOT_CONNECTED")} disabled={pending}>
          Reset
        </Button>
      )}
    </div>
  );
}
