import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { signOut } from "@/server/actions/auth";
import { requireUser } from "@/lib/auth";

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/checkout");
  return (
    <div className="min-h-screen bg-surface-2">
      <header className="border-b border-line bg-white">
        <div className="container-x flex h-16 items-center justify-between">
          <Logo href="/" />
          <div className="flex items-center gap-4 text-[13px] text-ink-muted">
            <span className="hidden sm:inline">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="font-medium text-ink-muted hover:text-ink">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="container-x py-10 md:py-16">{children}</main>
      <footer className="container-x pb-10 text-center text-[12px] text-ink-faint">
        <Link href="/terms" className="hover:text-ink">
          Terms
        </Link>
        <span className="mx-2">·</span>
        <Link href="/guarantee" className="hover:text-ink">
          Guarantee terms
        </Link>
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:text-ink">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
