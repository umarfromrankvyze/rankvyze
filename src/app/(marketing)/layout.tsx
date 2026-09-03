import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { SiteJsonLd } from "@/components/seo/json-ld";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteJsonLd />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
