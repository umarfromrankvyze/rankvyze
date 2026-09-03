"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bell, Check, ChevronsUpDown, Globe, LogOut, Menu, Settings, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, CompanyAvatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelative } from "@/lib/utils";
import { switchWebsite } from "@/server/actions/workspace";
import { signOut } from "@/server/actions/auth";
import type { SessionUser } from "@/lib/auth";

export interface Notification {
  id: string;
  title: string;
  description: string;
  href: string;
  at: string;
  tone?: "brand" | "success" | "warning" | "info";
}

interface TopbarProps {
  user: SessionUser;
  websites: { id: string; name: string; domain: string }[];
  currentWebsiteId: string | null;
  notifications: Notification[];
  mobileNav: React.ReactNode;
  plan?: string;
  admin?: boolean;
  title?: string;
}

export function Topbar({ user, websites, currentWebsiteId, notifications, mobileNav, plan, admin, title }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const current = websites.find((w) => w.id === currentWebsiteId) ?? websites[0];

  const choose = (id: string) => {
    if (id === current?.id) return;
    start(async () => {
      await switchWebsite(id);
      toast.success("Switched workspace.");
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white/85 px-4 backdrop-blur-xl md:px-6">
      {/* Mobile drawer */}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Trigger asChild>
          <button type="button" className="-ml-1 inline-flex size-9 items-center justify-center rounded-lg text-ink hover:bg-surface-3 lg:hidden" aria-label="Open navigation">
            <Menu className="size-5" />
          </button>
        </DialogPrimitive.Trigger>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in lg:hidden" />
          <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 w-[280px] bg-surface-2 shadow-float outline-none data-[state=open]:animate-[slide-in-left_0.3s_cubic-bezier(0.16,1,0.3,1)] lg:hidden">
            <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
            <DialogPrimitive.Close className="absolute right-3 top-4 rounded-md p-1 text-ink-faint hover:bg-white hover:text-ink">
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
            <div className="h-full" onClick={() => setOpen(false)}>
              {mobileNav}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Website switcher */}
      {admin ? (
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-brand-500" />
          <span className="text-[13.5px] font-semibold text-ink">{title ?? "Admin"}</span>
        </div>
      ) : current ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-9 max-w-[240px] items-center gap-2 rounded-lg border border-line bg-white px-2 pr-2.5 text-[13px] font-medium text-ink transition-colors hover:border-ink/25",
                pending && "opacity-60",
              )}
            >
              <CompanyAvatar name={current.name} size="sm" accent />
              <span className="truncate">{current.domain}</span>
              <ChevronsUpDown className="size-3.5 text-ink-faint" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Websites</DropdownMenuLabel>
            {websites.map((w) => (
              <DropdownMenuItem key={w.id} onSelect={() => choose(w.id)}>
                <CompanyAvatar name={w.name} size="sm" accent={w.id === current.id} />
                <span className="flex-1 truncate">
                  <span className="block text-[13px] font-medium">{w.name}</span>
                  <span className="block text-[11.5px] text-ink-faint">{w.domain}</span>
                </span>
                {w.id === current.id && <Check className="text-brand-500" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings?tab=website">
                <Globe /> Website settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      {plan && !admin && (
        <Badge variant={plan === "TRIAL" ? "brand" : "neutral"} className="hidden sm:inline-flex">
          {plan === "TRIAL" ? "Free trial" : `${plan.charAt(0)}${plan.slice(1).toLowerCase()} plan`}
        </Badge>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="relative inline-flex size-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink" aria-label="Notifications">
              <Bell className="size-[18px]" />
              {notifications.length > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-500 ring-2 ring-white" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[340px] p-0">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-[13px] font-semibold text-ink">Notifications</p>
              <span className="text-[11.5px] text-ink-faint">{notifications.length} new</span>
            </div>
            <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-[13px] text-ink-muted">You&apos;re all caught up.</p>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem key={n.id} asChild className="rounded-none border-b border-line px-4 py-3 last:border-0">
                    <Link href={n.href} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-1.5 size-2 shrink-0 rounded-full",
                          n.tone === "success" && "bg-success",
                          n.tone === "warning" && "bg-warning",
                          n.tone === "info" && "bg-info",
                          (!n.tone || n.tone === "brand") && "bg-brand-500",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-ink">{n.title}</span>
                        <span className="block text-[12px] leading-snug text-ink-muted">{n.description}</span>
                        <span className="mt-1 block text-[11px] text-ink-faint">{formatRelative(n.at)}</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="inline-flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-surface-3" aria-label="Account menu">
              <Avatar name={user.name} src={user.image} size="sm" />
              <span className="hidden text-[13px] font-medium text-ink md:inline">{user.name.split(" ")[0]}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2.5 py-2">
              <p className="text-[13px] font-medium text-ink">{user.name}</p>
              <p className="truncate text-[12px] text-ink-faint">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            {!admin && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings /> Settings
                </Link>
              </DropdownMenuItem>
            )}
            {user.role === "ADMIN" && (
              <DropdownMenuItem asChild>
                <Link href={admin ? "/dashboard" : "/admin"}>
                  <ShieldCheck /> {admin ? "Customer view" : "Admin dashboard"}
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => start(() => signOut())}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
