"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteAudit, deleteIssue } from "@/server/actions/admin";

function DeleteButton({ title, description, onConfirm }: { title: string; description: string; onConfirm: () => Promise<{ ok: boolean; error?: string; message?: string }> }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)} aria-label="Delete">
        <Trash2 />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel="Delete"
        destructive
        loading={pending}
        onConfirm={() =>
          start(async () => {
            const r = await onConfirm();
            if (r.ok) toast.success(r.message); else toast.error(r.error ?? "Failed");
            setOpen(false);
          })
        }
      />
    </>
  );
}

export function DeleteAuditButton({ id }: { id: string }) {
  return <DeleteButton title="Delete this audit?" description="Issues attached to it stay, but lose the audit link. The customer will see the previous audit." onConfirm={() => deleteAudit(id)} />;
}

export function DeleteIssueButton({ id }: { id: string }) {
  return <DeleteButton title="Delete this issue?" description="Linked optimizations lose their issue reference." onConfirm={() => deleteIssue(id)} />;
}
