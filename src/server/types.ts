import type { FieldErrors } from "@/lib/validation";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

export const initialActionState: ActionResult = { ok: false, error: "" };

export function fail(error: string, fieldErrors?: FieldErrors): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

export function succeed<T>(data?: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}
