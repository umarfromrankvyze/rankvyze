"use client";

import { Select, type SelectProps } from "@/components/ui/input";

export interface WebsiteOption {
  id: string;
  name: string;
  domain: string;
  organization: { name: string };
}

export function WebsiteSelect({ websites, ...props }: { websites: WebsiteOption[] } & SelectProps) {
  return (
    <Select {...props}>
      <option value="">Choose a website…</option>
      {websites.map((w) => (
        <option key={w.id} value={w.id}>
          {w.organization.name} — {w.domain}
        </option>
      ))}
    </Select>
  );
}
